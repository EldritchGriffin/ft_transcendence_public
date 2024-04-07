#!/bin/bash
expect <<EOF
  spawn npx prisma generate
  expect {
    "Ok to proceed? (y)" {
      send "y\r"
      exp_continue
    }
    eof
  }
EOF
expect <<EOF
  spawn npx --yes prisma migrate dev --name "init"
  expect {
    "We need to reset the \"public\" schema" {
      send "yes\r"
      exp_continue
    }
    "Enter a name for the new migration:" {
      # Send a predefined migration name or capture user input dynamically
      send "my_migration_name\r"
      exp_continue
    }
    "Are you sure you want to create and apply this migration?" {
      # Send a predefined migration name or capture user input dynamically
      send "y\r"
      exp_continue
    }
    eof
  }
EOF

npm run build
exec npm run start