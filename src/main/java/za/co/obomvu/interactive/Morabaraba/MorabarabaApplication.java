package za.co.obomvu.interactive.Morabaraba;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import za.co.obomvu.interactive.Morabaraba.service.PlayerService;

@SpringBootApplication
public class MorabarabaApplication implements CommandLineRunner {

	@Autowired
	private PlayerService playerService;

	public static void main(String[] args) {
		SpringApplication.run(MorabarabaApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
	}

}
