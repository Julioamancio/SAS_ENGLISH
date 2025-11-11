import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log("🌱 Starting seed...");

try {
  // Insert demo admin user (will be created via OAuth, but we can set role)
  console.log("✓ Admin user will be created on first login");

  // Insert demo professor
  const [professorResult] = await connection.execute(
    `INSERT INTO professores (userId, nome, email) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
    [1, "Prof. João Silva", "joao.silva@example.com"]
  );
  const professorId = professorResult.insertId || 1;
  console.log(`✓ Created professor: Prof. João Silva (ID: ${professorId})`);

  // Insert demo turma
  const [turmaResult] = await connection.execute(
    `INSERT INTO turmas (nome, nivel, ano, professorId, ativa) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
    ["MED-1A", "Intermediário", 2025, professorId, true]
  );
  const turmaId = turmaResult.insertId || 1;
  console.log(`✓ Created turma: MED-1A (ID: ${turmaId})`);

  // Check if etapas already exist
  const [existingEtapas] = await connection.execute(
    `SELECT COUNT(*) as count FROM etapas WHERE turmaId = ?`,
    [turmaId]
  );

  if (existingEtapas[0].count === 0) {
    // Insert default etapas (30/35/35)
    await connection.execute(
      `INSERT INTO etapas (turmaId, numero, nome, pontosMaximos) VALUES
       (?, 1, '1ª Etapa', 30),
       (?, 2, '2ª Etapa', 35),
       (?, 3, '3ª Etapa', 35)`,
      [turmaId, turmaId, turmaId]
    );
    console.log("✓ Created default etapas (30/35/35)");
  } else {
    console.log("✓ Etapas already exist, skipping");
  }

  // Insert demo alunos
  const alunos = [
    { ra: "2025001", nome: "Maria Santos", nivel: "Intermediário" },
    { ra: "2025002", nome: "Pedro Oliveira", nivel: "Intermediário" },
    { ra: "2025003", nome: "Ana Costa", nivel: "Intermediário" },
    { ra: "2025004", nome: "Carlos Souza", nivel: "Intermediário" },
    { ra: "2025005", nome: "Julia Lima", nivel: "Intermediário" },
  ];

  for (const aluno of alunos) {
    const [alunoResult] = await connection.execute(
      `INSERT INTO alunos (ra, nome, nivel) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nome = VALUES(nome)`,
      [aluno.ra, aluno.nome, aluno.nivel]
    );
    const alunoId = alunoResult.insertId || (await connection.execute(
      `SELECT id FROM alunos WHERE ra = ?`,
      [aluno.ra]
    ))[0][0].id;

    // Create matricula
    await connection.execute(
      `INSERT INTO matriculas (alunoId, turmaId, ativa, dataInicio) VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE ativa = VALUES(ativa)`,
      [alunoId, turmaId, true]
    );
  }
  console.log(`✓ Created ${alunos.length} demo alunos with matriculas`);

  // Insert demo atividade
  const [etapa1] = await connection.execute(
    `SELECT id FROM etapas WHERE turmaId = ? AND numero = 1 LIMIT 1`,
    [turmaId]
  );
  
  if (etapa1[0]) {
    const etapa1Id = etapa1[0].id;
    await connection.execute(
      `INSERT INTO atividades (etapaId, titulo, data, pontuacaoMaxima) VALUES (?, ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo)`,
      [etapa1Id, "Prova de Vocabulário", 10]
    );
    console.log("✓ Created demo atividade");
  }

  // Insert default configurations
  await connection.execute(
    `INSERT INTO configuracoes (chave, valor, descricao) VALUES
     ('etapa_1_pontos', '30', 'Pontos padrão da 1ª Etapa'),
     ('etapa_2_pontos', '35', 'Pontos padrão da 2ª Etapa'),
     ('etapa_3_pontos', '35', 'Pontos padrão da 3ª Etapa')
     ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
    []
  );
  console.log("✓ Created default configurations");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Demo data created:");
  console.log("   - 1 Professor: Prof. João Silva");
  console.log("   - 1 Turma: MED-1A (Intermediário 2025)");
  console.log("   - 3 Etapas: 30/35/35 pontos");
  console.log("   - 5 Alunos matriculados");
  console.log("   - 1 Atividade de exemplo");
  console.log("\n💡 Login as admin to access all features");

} catch (error) {
  console.error("❌ Seed failed:", error);
  process.exit(1);
} finally {
  await connection.end();
}
