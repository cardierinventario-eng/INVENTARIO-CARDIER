CREATE TABLE `config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chave` text NOT NULL,
	`valor` text NOT NULL,
	`data_criacao` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `config_chave_unique` ON `config` (`chave`);--> statement-breakpoint
CREATE TABLE `fornecedores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`email` text,
	`telefone` text,
	`endereco` text,
	`cnpj` text,
	`observacoes` text,
	`ativo` integer DEFAULT 1,
	`data_criacao` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `grupos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`cor` text DEFAULT '#3B82F6',
	`ativo` integer DEFAULT 1,
	`data_criacao` text DEFAULT CURRENT_TIMESTAMP,
	`data_atualizacao` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grupos_nome_unique` ON `grupos` (`nome`);--> statement-breakpoint
CREATE TABLE `itens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`grupo_id` integer NOT NULL,
	`quantidade` real DEFAULT 0 NOT NULL,
	`unidade` text NOT NULL,
	`valor_unitario` real DEFAULT 0 NOT NULL,
	`estoque_minimo` real,
	`estoque_ideal` real,
	`localizacao` text,
	`sku` text,
	`observacoes` text,
	`ativo` integer DEFAULT 1,
	`data_criacao` text DEFAULT CURRENT_TIMESTAMP,
	`data_atualizacao` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `movimentacoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`quantidade` real NOT NULL,
	`quantidade_anterior` real,
	`quantidade_nova` real,
	`motivo` text,
	`observacoes` text,
	`usuario` text,
	`data_criacao` text DEFAULT CURRENT_TIMESTAMP
);
