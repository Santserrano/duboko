# Duboko - Productivity Environment

Duboko is a web productivity application that allows users to create and manage notes efficiently, with the option to work either locally or with a registered account.

## 🚀 Features

- Pomodoro timer
- Custom sounds
- 10+ Scenes
- Daily Tasks
- Calendar
- PDF Reader
- Custom playlists
- Insights
- Notes
- YT Player
- 📁 Group organization
- 🔒 Optional authentication with Clerk
- 💾 Local storage for unregistered users

## 🛠️ Technologies

- [Next.js 15](https://nextjs.org/)
- [Clerk](https://clerk.com/) – Authentication
- [Prisma](https://www.prisma.io/) – ORM
- [TipTap](https://tiptap.dev/) – Rich text editor
- [Radix UI](https://www.radix-ui.com/) – UI components

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Santserrano/duboko.git
cd duboko
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:  
   Create a `.env` file in the project root following the structure of `.env.example`.

4. Initialize the database:

```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:

```bash
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
