# Quick start

- The backend is built with Java 17, Maven, and Spring Boot.
    You will need Java 17 and Maven installed.
    You can run it with:

- **IDE (Backend/Full-stack candidates)**: Open the main class [./src/main/java/com/coveo/challenge/ReviewChallengeApplication.java](./src/main/java/com/coveo/challenge/ReviewChallengeApplication.java) in an IDE and start it (debug or run mode).

- **Command Line (Frontend candidates)**: Run `mvn clean package -T1C -U -Dmaven.test.skip=true` in the `./backend` folder, then execute `java -jar target/review-challenge-0.0.1-SNAPSHOT.jar`.
    If port 8080 is unavailable, use `-Dserver.port=8081`, but note the frontend expects port 8080.
