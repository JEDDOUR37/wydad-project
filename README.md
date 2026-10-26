# 🔴⚫ Wydad Athletic Club | Official Fan Website

A modern, interactive fan website dedicated to **Wydad Athletic Club (WAC)**, one of Morocco's most iconic football clubs. Built to celebrate the club's history, players, trophies, matches, and passionate supporters.

## 📌 About the Project

This project is a football-themed website designed with a modern interface, responsive layouts, and interactive features. It combines the identity of Wydad Athletic Club with practical front-end development techniques.

The website is also a learning project through which I develop my skills in web development, JavaScript, and user interface design.

## ✨ Features

- 🔴 **Modern Design:** Red-and-black theme inspired by Wydad Athletic Club.
- 🏆 **Trophy Collection:** Showcase of the club's achievements and history.
- ⚽ **Players Section:** Player cards with photos and information.
- 📅 **Match Center:** Display of upcoming matches and match information.
- 📊 **Results & Standings:** Organized football results and classification tables.
- 🎮 **Interactive Games:** Football quiz and Guess the Player challenge.
- 🛍️ **Online Shop:** Product cards, wishlist, and shopping cart interface.
- 🌙 **Theme Toggle:** Switch between light and dark themes.
- 🔐 **Animated Login Page:** A lamp-inspired login interface with a light-reveal animation.
- 📱 **Responsive Layout:** Designed to work across desktop and mobile screens.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling, animations, and responsive design |
| JavaScript | Interactive features and page behavior |
| Font Awesome | Icons |
| Google Fonts | Typography |

## 📂 Project Structure

```text
WYDAD/
├── index.html        # Main website
├── login.html        # Animated login page
├── css/
│   ├── style.css     # Main website styles
│   └── login.css     # Login page styles
├── js/
│   ├── app.js        # Main script (theme, shop, quiz, games, match center)
│   └── login.js      # Login interactions
├── data/
│   ├── results.json  # Latest results (loaded with fetch)
│   └── match.json    # Next match for the countdown
├── img/              # Images
└── README.md
```

### Updating the Match Center

Edit `data/match.json`: replace `"next": null` with the block shown in `_example` (real date, opponent and venue).

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/JEDDOUR37/WYDAD.git
```

### 2. Open the project

Open the project folder in Visual Studio Code.

### 3. Run the website

Use the **Live Server** extension in VS Code and open `index.html` through the local server.

The login page appears first. Use **Use demo account** or **Continue as guest** to enter.

> `fetch()` does not work when opening the file by double-click (`file://`). Use Live Server or GitHub Pages; otherwise the site falls back to built-in data.

## 🔐 Login Demo

For local demonstration only:

- **Username:** `wydad`
- **Password:** `1234`

> **Security note:** This is a front-end demonstration, not secure authentication. The credentials are visible in the JavaScript source code. A production website should use a secure backend authentication system.

## 🎯 Project Goals

- Improve my front-end development skills.
- Practice JavaScript (DOM, events, localStorage, fetch) in a real project.
- Build interactive and reusable website components.
- Learn responsive design and user experience principles.
- Explore how football-related data and features can be integrated into a website.

## 🔮 Future Improvements

- Connect live match results and standings to a football API.
- Add a secure backend authentication system.
- Create user profiles and account management.
- Integrate a database for players, matches, and products.
- Develop a complete online shop with checkout functionality.
- Improve accessibility and performance.

## 👨‍💻 About Me

I'm a **third-year Computer Science student** interested in programming, especially web development. I enjoy building practical projects, learning new technologies, and turning ideas into interactive websites.

I'm continuously improving my skills and exploring new ways to build modern, useful, and professional applications.

## 🤝 Contributions

Suggestions, feedback, and contributions are welcome. Feel free to open an issue or submit a pull request.

## 📄 License

This is an **unofficial fan site**, intended for educational and portfolio purposes. Wydad Athletic Club names, logos, and related assets belong to their respective owners.

---

**DIMA WYDAD ❤️🖤**

*Built with passion for football and web development.*
