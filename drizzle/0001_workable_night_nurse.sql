CREATE TABLE `alunos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ra` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`nivel` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alunos_id` PRIMARY KEY(`id`),
	CONSTRAINT `alunos_ra_unique` UNIQUE(`ra`)
);
--> statement-breakpoint
CREATE TABLE `atividades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`etapaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`data` timestamp NOT NULL,
	`pontuacaoMaxima` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `atividades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255) NOT NULL,
	`acao` varchar(255) NOT NULL,
	`entidade` varchar(100) NOT NULL,
	`entidadeId` int,
	`detalhes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configuracoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chave` varchar(100) NOT NULL,
	`valor` text NOT NULL,
	`descricao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `configuracoes_chave_unique` UNIQUE(`chave`)
);
--> statement-breakpoint
CREATE TABLE `etapas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`turmaId` int NOT NULL,
	`numero` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`pontosMaximos` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `etapas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`etapaId` int NOT NULL,
	`alunoId` int NOT NULL,
	`desempenhoAcademico` text,
	`frequencia` int,
	`comportamento` enum('Excelente','Ok','Inapropriado'),
	`observacoesGerais` text,
	`comentariosConselho` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historicoFeedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedbackId` int NOT NULL,
	`autorId` int NOT NULL,
	`autorNome` varchar(255) NOT NULL,
	`descricaoMudanca` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historicoFeedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matriculas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alunoId` int NOT NULL,
	`turmaId` int NOT NULL,
	`ativa` boolean NOT NULL DEFAULT true,
	`dataInicio` timestamp NOT NULL DEFAULT (now()),
	`dataFim` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matriculas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`atividadeId` int NOT NULL,
	`alunoId` int NOT NULL,
	`nota` int NOT NULL,
	`comentario` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `turmas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`nivel` varchar(100) NOT NULL,
	`ano` int NOT NULL,
	`professorId` int NOT NULL,
	`ativa` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `turmas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','professor') NOT NULL DEFAULT 'user';