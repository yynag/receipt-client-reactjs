import { baseUrl, sleep } from "./shared";

export class UserApi {
  static async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${baseUrl}/users/public/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      throw new Error("Login failed: " + (await response.text()));
    }
    const data: User = await response.json();
    return data;
  }
}

export class UserApiMock {
  static async login(username: string, password: string): Promise<User> {
    console.log("Mock login", username, password);
    await sleep(1000);
    return {
      id: "1",
      name: username,
      role: "admin"
    };
  }
}

interface User {
  id: string;
  name: string;
  role: string;
}
