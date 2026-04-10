require('dotenv').config();
const db = require('./js/db');

const today = new Date().toISOString().split('T')[0];
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const newBooks = [
  { title: 'The Pragmatic Programmer',       author: 'Andrew Hunt & David Thomas', category: 'Technology',  description: 'Your journey to mastery in software development.',              total_copies: 5  },
  { title: 'Design Patterns',                author: 'Erich Gamma et al.',          category: 'Technology',  description: 'Elements of Reusable Object-Oriented Software.',               total_copies: 3  },
  { title: '1984',                           author: 'George Orwell',               category: 'Literature',  description: 'A dystopian social science fiction novel and cautionary tale.', total_copies: 8  },
  { title: 'To Kill a Mockingbird',          author: 'Harper Lee',                  category: 'Literature',  description: 'A novel about the serious issues of rape and racial inequality.',total_copies: 4  },
  { title: 'Sapiens: A Brief History',       author: 'Yuval Noah Harari',           category: 'History',     description: 'Explores the history of the human species.',                    total_copies: 7  },
  { title: 'Atomic Habits',                  author: 'James Clear',                 category: 'Other',       description: 'An easy & proven way to build good habits & break bad ones.',  total_copies: 10 },
  { title: 'The Alchemist',                  author: 'Paulo Coelho',                category: 'Literature',  description: 'A philosophical novel about following your dreams.',             total_copies: 6  },
  { title: 'Thinking, Fast and Slow',        author: 'Daniel Kahneman',             category: 'Philosophy',  description: 'Explores two systems of thought that drive decisions.',          total_copies: 4  },
  { title: 'A Brief History of Time',        author: 'Stephen Hawking',             category: 'Science',     description: 'Landmark volume in science writing by Hawking.',                total_copies: 5  },
  { title: 'The Art of War',                 author: 'Sun Tzu',                     category: 'Philosophy',  description: 'Ancient Chinese military treatise on strategy.',                total_copies: 6  },
  { title: 'Harry Potter and the Sorcerers Stone', author: 'J.K. Rowling',         category: 'Literature',  description: 'The first novel in the Harry Potter fantasy series.',            total_copies: 8  },
  { title: 'The Da Vinci Code',              author: 'Dan Brown',                   category: 'Literature',  description: 'A mystery thriller novel involving secret societies.',           total_copies: 5  },
  { title: 'Rich Dad Poor Dad',              author: 'Robert Kiyosaki',             category: 'Economics',   description: 'Personal finance and investing education classic.',              total_copies: 7  },
  { title: 'Zero to One',                    author: 'Peter Thiel',                 category: 'Economics',   description: 'Notes on startups and how to build the future.',                total_copies: 4  },
  { title: 'The Theory of Everything',       author: 'Stephen Hawking',             category: 'Science',     description: 'Origin and fate of the universe explained simply.',             total_copies: 3  },
];

async function seed() {
  let inserted = 0;
  for (const b of newBooks) {
    try {
      await db.execute(
        `INSERT INTO books (book_id, title, author, category, description, total_copies, available_copies, added_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [genId(), b.title, b.author, b.category, b.description, b.total_copies, b.total_copies, today]
      );
      inserted++;
      console.log(`✅ Added: ${b.title}`);
    } catch (err) {
      console.log(`⚠️  Skipped (already exists): ${b.title}`);
    }
  }
  console.log(`\n🎉 Done! ${inserted} book(s) inserted into MySQL.`);
  process.exit(0);
}

seed();
