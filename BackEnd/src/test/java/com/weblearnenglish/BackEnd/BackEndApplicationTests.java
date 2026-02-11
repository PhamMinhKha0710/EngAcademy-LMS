package com.weblearnenglish.BackEnd;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = com.englishlearn.EnglishLearnApplication.class)
@ActiveProfiles("test")
class BackEndApplicationTests {

	@Test
	void contextLoads() {
	}

}
