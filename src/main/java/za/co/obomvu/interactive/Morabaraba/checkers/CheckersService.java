package za.co.obomvu.interactive.Morabaraba.checkers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.obomvu.interactive.Morabaraba.domain.PlayerEnum;

import java.util.*;

@Service
@Transactional
public class CheckersService {

    @Autowired
    private CheckersGameRepository checkersGameRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // ── Setup ──────────────────────────────────────────────────────────────────

    public UUID createNewGame() {
        CheckersBoard board = createInitialBoard();
        UUID id = UUID.randomUUID();
        try {
            saveGame(id, board);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to save checkers game", e);
        }
        return id;
    }

    private CheckersBoard createInitialBoard() {
        List<CheckersSquare> squares = new ArrayList<>();
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                if ((row + col) % 2 == 1) {
                    CheckersSquare sq = new CheckersSquare(row, col);
                    if (row <= 2) sq.setOccupiedBy(PlayerEnum.PLAYER_2);
                    else if (row >= 5) sq.setOccupiedBy(PlayerEnum.PLAYER_1);
                    squares.add(sq);
                }
            }
        }
        Map<PlayerEnum, Integer> captured = new EnumMap<>(PlayerEnum.class);
        captured.put(PlayerEnum.PLAYER_1, 0);
        captured.put(PlayerEnum.PLAYER_2, 0);
        return new CheckersBoard(squares, new CheckersGameState(PlayerEnum.PLAYER_1, null, captured, null));
    }

    // ── Persistence ────────────────────────────────────────────────────────────

    public CheckersBoard loadGame(UUID id) throws JsonProcessingException {
        CheckersGameEntity entity = checkersGameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checkers game not found"));
        return objectMapper.readValue(entity.getBoardJson(), CheckersBoard.class);
    }

    private void saveGame(UUID id, CheckersBoard board) throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(board);
        CheckersGameEntity entity = checkersGameRepository.findById(id)
                .orElse(new CheckersGameEntity(id, null));
        entity.setBoardJson(json);
        checkersGameRepository.save(entity);
    }

    // ── Move ───────────────────────────────────────────────────────────────────

    public void makeMove(UUID gameId, CheckersMoveRequest request) throws JsonProcessingException {
        CheckersBoard board = loadGame(gameId);

        if (board.getGameState().getWinner() != null) {
            throw new IllegalArgumentException("Game is already over");
        }

        PlayerEnum current = board.getGameState().getCurrentPlayer();
        String fromId = request.getFrom();
        String toId = request.getTo();

        // Multi-jump: only the piece mid-jump may be moved
        if (board.getGameState().getMustJumpFrom() != null
                && !board.getGameState().getMustJumpFrom().equals(fromId)) {
            throw new IllegalArgumentException("Must continue jump with piece at " + board.getGameState().getMustJumpFrom());
        }

        CheckersSquare from = findById(board, fromId);
        CheckersSquare to   = findById(board, toId);

        if (from == null || to == null) throw new IllegalArgumentException("Invalid square ID");
        if (!current.equals(from.getOccupiedBy())) throw new IllegalArgumentException("Not your piece");
        if (to.getOccupiedBy() != null) throw new IllegalArgumentException("Target square is occupied");

        int rowDiff = to.getRow() - from.getRow();
        int colDiff = to.getCol() - from.getCol();

        if (Math.abs(rowDiff) != Math.abs(colDiff)) throw new IllegalArgumentException("Must move diagonally");

        boolean isCapture = Math.abs(rowDiff) == 2;
        boolean isSimple  = Math.abs(rowDiff) == 1;

        if (!isCapture && !isSimple) throw new IllegalArgumentException("Invalid move distance");

        // Direction enforcement for non-kings
        if (!from.isKing()) {
            if (current == PlayerEnum.PLAYER_1 && rowDiff > 0)
                throw new IllegalArgumentException("Non-king can only move forward");
            if (current == PlayerEnum.PLAYER_2 && rowDiff < 0)
                throw new IllegalArgumentException("Non-king can only move forward");
        }

        if (isSimple) {
            if (board.getGameState().getMustJumpFrom() == null && hasAnyCapture(board, current)) {
                throw new IllegalArgumentException("A capture is available and must be taken");
            }
            executeSimpleMove(from, to);
        } else {
            int midRow = (from.getRow() + to.getRow()) / 2;
            int midCol = (from.getCol() + to.getCol()) / 2;
            CheckersSquare mid = findByRowCol(board, midRow, midCol);

            if (mid == null || mid.getOccupiedBy() == null || mid.getOccupiedBy().equals(current))
                throw new IllegalArgumentException("No opponent piece to jump over");

            mid.setOccupiedBy(null);
            mid.setKing(false);
            executeSimpleMove(from, to);
            board.getGameState().getCapturedPieces().merge(current, 1, Integer::sum);

            promoteIfNeeded(to);

            if (checkWin(board)) {
                saveGame(gameId, board);
                return;
            }

            // Check for additional jump from new position
            if (hasJumpFrom(board, to)) {
                board.getGameState().setMustJumpFrom(to.getId());
                saveGame(gameId, board);
                return;
            }
        }

        promoteIfNeeded(to);
        board.getGameState().setMustJumpFrom(null);

        PlayerEnum next = opponent(current);
        board.getGameState().setCurrentPlayer(next);

        if (checkWin(board)) {
            saveGame(gameId, board);
            return;
        }

        saveGame(gameId, board);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void executeSimpleMove(CheckersSquare from, CheckersSquare to) {
        to.setOccupiedBy(from.getOccupiedBy());
        to.setKing(from.isKing());
        from.setOccupiedBy(null);
        from.setKing(false);
    }

    private void promoteIfNeeded(CheckersSquare sq) {
        if (sq.getOccupiedBy() == PlayerEnum.PLAYER_1 && sq.getRow() == 0) sq.setKing(true);
        if (sq.getOccupiedBy() == PlayerEnum.PLAYER_2 && sq.getRow() == 7) sq.setKing(true);
    }

    private boolean checkWin(CheckersBoard board) {
        for (PlayerEnum p : PlayerEnum.values()) {
            long pieceCount = board.getSquares().stream()
                    .filter(s -> p.equals(s.getOccupiedBy())).count();
            if (pieceCount == 0 || !hasAnyValidMove(board, p)) {
                board.getGameState().setWinner(opponent(p));
                return true;
            }
        }
        return false;
    }

    private boolean hasAnyCapture(CheckersBoard board, PlayerEnum player) {
        return board.getSquares().stream()
                .filter(s -> player.equals(s.getOccupiedBy()))
                .anyMatch(s -> hasJumpFrom(board, s));
    }

    private boolean hasAnyValidMove(CheckersBoard board, PlayerEnum player) {
        if (hasAnyCapture(board, player)) return true;
        for (CheckersSquare sq : board.getSquares()) {
            if (!player.equals(sq.getOccupiedBy())) continue;
            for (int[] d : directions(sq, player)) {
                int nr = sq.getRow() + d[0], nc = sq.getCol() + d[1];
                if (inBounds(nr, nc)) {
                    CheckersSquare t = findByRowCol(board, nr, nc);
                    if (t != null && t.getOccupiedBy() == null) return true;
                }
            }
        }
        return false;
    }

    private boolean hasJumpFrom(CheckersBoard board, CheckersSquare sq) {
        PlayerEnum player = sq.getOccupiedBy();
        if (player == null) return false;
        for (int[] d : directions(sq, player)) {
            int mr = sq.getRow() + d[0], mc = sq.getCol() + d[1];
            int tr = sq.getRow() + d[0] * 2, tc = sq.getCol() + d[1] * 2;
            if (!inBounds(tr, tc)) continue;
            CheckersSquare mid    = findByRowCol(board, mr, mc);
            CheckersSquare target = findByRowCol(board, tr, tc);
            if (mid != null && mid.getOccupiedBy() != null && !mid.getOccupiedBy().equals(player)
                    && target != null && target.getOccupiedBy() == null) return true;
        }
        return false;
    }

    private List<int[]> directions(CheckersSquare sq, PlayerEnum player) {
        if (sq.isKing()) return Arrays.asList(new int[]{-1,-1}, new int[]{-1,1}, new int[]{1,-1}, new int[]{1,1});
        if (player == PlayerEnum.PLAYER_1) return Arrays.asList(new int[]{-1,-1}, new int[]{-1,1});
        return Arrays.asList(new int[]{1,-1}, new int[]{1,1});
    }

    private boolean inBounds(int r, int c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

    private PlayerEnum opponent(PlayerEnum p) {
        return p == PlayerEnum.PLAYER_1 ? PlayerEnum.PLAYER_2 : PlayerEnum.PLAYER_1;
    }

    private CheckersSquare findById(CheckersBoard board, String id) {
        return board.getSquares().stream().filter(s -> s.getId().equals(id)).findFirst().orElse(null);
    }

    private CheckersSquare findByRowCol(CheckersBoard board, int row, int col) {
        return board.getSquares().stream()
                .filter(s -> s.getRow() == row && s.getCol() == col).findFirst().orElse(null);
    }
}