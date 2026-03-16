import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/?useSSL=false&allowPublicKeyRetrieval=true";
        String[] users = {"dev", "root"};
        String[] passwords = {"dev123", ""};
        
        for (int i = 0; i < users.length; i++) {
            try (Connection conn = DriverManager.getConnection(url, users[i], passwords[i])) {
                System.out.println("Connection successful for user: " + users[i]);
            } catch (SQLException e) {
                System.out.println("Connection failed for user: " + users[i] + " - " + e.getMessage());
            }
        }
    }
}
