# Contributing

We welcome contributions to the Crochet Instagram Archive! 

To contribute:
1. Create a feature branch (`git checkout -b feature/my-feature`).
2. Make your changes and add/update tests as necessary.
3. Run `pytest tests/` to ensure all tests pass.
4. Commit your changes locally.
5. Push your branch and open a Pull Request.

## Important Security Guidelines
- **NEVER** commit API keys, `.env` files, passwords, or personal credentials.
- **NEVER** commit your `data/raw/`, `data/organized/`, or `archive.db` SQLite files.
- **NEVER** commit downloaded images, thumbnails, or user data.
- Ensure your `.gitignore` rules are respected before pushing.
