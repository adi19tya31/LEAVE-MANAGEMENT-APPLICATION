// Run: npx ts-node dumpDatabase.ts
// Exports every table's CREATE TABLE statement + all its rows as INSERT
// statements, into a single .sql file — no mysqldump, no GUI tool involved.
// Uses the exact same credentials your app already connects with successfully.
import dotenv from "dotenv";
dotenv.config();
import mysql, { RowDataPacket } from "mysql2/promise";
import fs from "fs";

interface TableNameRow extends RowDataPacket {
  [key: string]: any;
}

interface CreateTableRow extends RowDataPacket {
  "Create Table": string;
}

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const dbName = process.env.DB_NAME;
  const outFile = `${dbName}_dump_${new Date().toISOString().split("T")[0]}.sql`;
  const lines: string[] = [];

  lines.push(`-- Dump of database '${dbName}' — generated ${new Date().toISOString()}`);
  lines.push("SET FOREIGN_KEY_CHECKS=0;", "");

  const [tableRows] = await connection.query<TableNameRow[]>("SHOW TABLES");
  const tableNames = tableRows.map((row) => Object.values(row)[0] as string);

  console.log(`Found ${tableNames.length} table(s): ${tableNames.join(", ")}`);

  for (const table of tableNames) {
    console.log(`Dumping ${table}...`);

    // --- schema ---
    const [createRows] = await connection.query<CreateTableRow[]>(
      `SHOW CREATE TABLE \`${table}\``
    );
    lines.push(`-- ----------------------------`, `-- Table: ${table}`, `-- ----------------------------`);
    lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);
    lines.push(`${createRows[0]["Create Table"]};`, "");

    // --- data ---
    const [dataRows] = await connection.query<RowDataPacket[]>(`SELECT * FROM \`${table}\``);
    if (dataRows.length > 0) {
      const columns = Object.keys(dataRows[0]);
      for (const row of dataRows) {
        const values = columns
          .map((col) => {
            const val = row[col];
            if (val === null) return "NULL";
            if (typeof val === "number") return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
            return `'${String(val).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
          })
          .join(", ");
        lines.push(
          `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(", ")}) VALUES (${values});`
        );
      }
      lines.push("");
    }
  }

  lines.push("SET FOREIGN_KEY_CHECKS=1;");

  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.log(`\n✅ Dump written to ${outFile}`);

  await connection.end();
}

run().catch((err: Error) => console.error("❌ Failed:", err.message));