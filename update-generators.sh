#!/bin/bash

# Find all generator files
files=$(find src/cli -name "generator*.ts" | xargs grep -l "statement.body.statement")

# Loop through each file and update it
for file in $files; do
  echo "Updating $file..."
  sed -i 's/const body = statement.body.$type === '\''IndentedLocalBlock'\'' \?.*: generateStatement(statement.body.statement);/let body = '\'''\'';\nif (statement.body.$type === '\''IndentedLocalBlock'\'') {\n                body = generateStatements({ $type: '\''StartScript'\'', statements: statement.body.statements } as StartScript);\n            } else if (statement.body.$type === '\''InlineLocalBlock'\'') {\n                body = generateStatement(statement.body.statement);\n            } else {\n                \/\/ It'\''s a Statements object\n                body = generateStatements({ $type: '\''StartScript'\'', statements: statement.body } as StartScript);\n            }/g' "$file"
done

echo "All files updated!"
