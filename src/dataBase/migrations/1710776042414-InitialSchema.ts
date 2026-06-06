import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1710776042414 implements MigrationInterface {
    name = 'InitialSchema1710776042414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`role\` enum ('admin', 'user', 'superAdmin') NOT NULL DEFAULT 'user', UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`precio\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(64) NOT NULL, \`abreviatura\` text NULL, \`importe\` decimal(10,2) NOT NULL, \`user_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`materia\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(128) NOT NULL, \`user_id\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_3bd07dd70269a7552da82058c5\` (\`nombre\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`libro\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(255) NOT NULL, \`descripcion\` varchar(255) NOT NULL, \`editorial\` varchar(64) NOT NULL, \`edicion\` int NOT NULL, \`nivel\` varchar(30) NOT NULL, \`cantidadPg\` int NOT NULL, \`anio\` varchar(4) NULL, \`adhesivo\` int NULL, \`autor\` varchar(32) NULL, \`img\` varchar(128) NOT NULL, \`especificacionesDefecto\` json NULL, \`user_id\` varchar(36) NOT NULL, \`materiaId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cliente_resumen\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`pendiente\` int NOT NULL DEFAULT '0', \`listo\` int NOT NULL DEFAULT '0', \`retirado\` int NOT NULL DEFAULT '0', \`cancelado\` int NOT NULL DEFAULT '0', \`user_id\` varchar(36) NOT NULL, \`cliente_id\` varchar(36) NULL, UNIQUE INDEX \`REL_cadd4795e1e0d2bd32b8d3157d\` (\`cliente_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`componente\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(30) NOT NULL, \`user_id\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_f15876494f2d7ec760112f0eea\` (\`nombre\`, \`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`propuesta\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(100) NOT NULL, \`user_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stock\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`stock\` int NOT NULL DEFAULT '0', \`pendiente\` int NOT NULL DEFAULT '0', \`listo\` int NOT NULL DEFAULT '0', \`retirado\` int NOT NULL DEFAULT '0', \`cancelado\` int NOT NULL DEFAULT '0', \`user_id\` varchar(36) NOT NULL, \`libro_id\` varchar(36) NULL, UNIQUE INDEX \`REL_615791b97541130b41eaa043dd\` (\`libro_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`especificacion\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(30) NOT NULL, \`user_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sede\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(64) NOT NULL, \`user_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`libro_pedido\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`cantidad\` int NOT NULL, \`detalles\` varchar(255) NULL, \`estado\` tinyint NOT NULL, \`user_id\` varchar(36) NOT NULL, \`libro_id\` varchar(36) NOT NULL, \`sedeId\` varchar(36) NOT NULL, \`pedido_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pedido\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`fechaEntrega\` date NULL, \`importeTotal\` decimal(10,2) NOT NULL, \`archivos\` int NULL, \`anillados\` int NULL, \`sena\` decimal(10,2) NOT NULL, \`estado\` tinyint NOT NULL DEFAULT '1', \`user_id\` varchar(36) NOT NULL, \`cliente_id\` varchar(36) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cliente\` (\`id\` varchar(36) NOT NULL, \`fechaCreacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`fechaActualizacion\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted\` tinyint NOT NULL, \`nombre\` varchar(100) NULL, \`telefono\` varchar(20) NULL, \`email\` varchar(255) NULL, \`user_id\` varchar(36) NOT NULL, UNIQUE INDEX \`IDX_9935842e3b6d6ac472cac5916b\` (\`telefono\`), UNIQUE INDEX \`IDX_503f81286c5e49acd6a832abf4\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`propuesta_libro\` (\`propuestaId\` varchar(36) NOT NULL, \`libroId\` varchar(36) NOT NULL, INDEX \`IDX_e27238f68d12430c8b217d75b4\` (\`propuestaId\`), INDEX \`IDX_f7d2b4fef6c4f7f97affe09289\` (\`libroId\`), PRIMARY KEY (\`propuestaId\`, \`libroId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`libros-componentes\` (\`libroId\` varchar(36) NOT NULL, \`componenteId\` varchar(36) NOT NULL, INDEX \`IDX_7f96b5c12cdce649fc36cb02c8\` (\`libroId\`), INDEX \`IDX_5760d0fcd362691f284a25b1db\` (\`componenteId\`), PRIMARY KEY (\`libroId\`, \`componenteId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`libro-pedido-especificaciones\` (\`libroPedidoId\` varchar(36) NOT NULL, \`especificacionId\` varchar(36) NOT NULL, INDEX \`IDX_be9f806317fe4a298fe40b2c4e\` (\`libroPedidoId\`), INDEX \`IDX_8ba77c1e2e4ad5516992915d80\` (\`especificacionId\`), PRIMARY KEY (\`libroPedidoId\`, \`especificacionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cliente_resumen\` ADD CONSTRAINT \`FK_e95251e7405cf29dcb9d7c9de29\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cliente_resumen\` ADD CONSTRAINT \`FK_cadd4795e1e0d2bd32b8d3157dd\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`componente\` ADD CONSTRAINT \`FK_103311a0d0ba5c2d7faf2ef6705\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`materia\` ADD CONSTRAINT \`FK_3d001406fff19d17859fb73fc68\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`propuesta\` ADD CONSTRAINT \`FK_3ed763bf276ccce3b303a9914a5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stock\` ADD CONSTRAINT \`FK_55437be5c4e111de5c6c4ec6254\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stock\` ADD CONSTRAINT \`FK_615791b97541130b41eaa043ddc\` FOREIGN KEY (\`libro_id\`) REFERENCES \`libro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libro\` ADD CONSTRAINT \`FK_35fc2f43f0fd386365c439ebb84\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libro\` ADD CONSTRAINT \`FK_c043d014799ea01ed4477868dea\` FOREIGN KEY (\`materiaId\`) REFERENCES \`materia\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`especificacion\` ADD CONSTRAINT \`FK_3e1296940fe4cfe441750b91b57\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sede\` ADD CONSTRAINT \`FK_ad55cec15d1ffe3441c6deb405b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` ADD CONSTRAINT \`FK_9c6403cb542965d97f87f0f85bf\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` ADD CONSTRAINT \`FK_85a659570a49714a2b4c114bf50\` FOREIGN KEY (\`libro_id\`) REFERENCES \`libro\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` ADD CONSTRAINT \`FK_eed9651583ff6570626934b2732\` FOREIGN KEY (\`sedeId\`) REFERENCES \`sede\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` ADD CONSTRAINT \`FK_c140a95f89d593aa809f3c2d625\` FOREIGN KEY (\`pedido_id\`) REFERENCES \`pedido\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pedido\` ADD CONSTRAINT \`FK_d98ea8b304d7570510076f97d4f\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pedido\` ADD CONSTRAINT \`FK_ab19fb380d17682f87649eded89\` FOREIGN KEY (\`cliente_id\`) REFERENCES \`cliente\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cliente\` ADD CONSTRAINT \`FK_1abba09fd4376b65247f23a4a86\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`precio\` ADD CONSTRAINT \`FK_2dac86d3f8fb74d0b00cb4059b6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`propuesta_libro\` ADD CONSTRAINT \`FK_e27238f68d12430c8b217d75b40\` FOREIGN KEY (\`propuestaId\`) REFERENCES \`propuesta\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`propuesta_libro\` ADD CONSTRAINT \`FK_f7d2b4fef6c4f7f97affe092895\` FOREIGN KEY (\`libroId\`) REFERENCES \`libro\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libros-componentes\` ADD CONSTRAINT \`FK_7f96b5c12cdce649fc36cb02c88\` FOREIGN KEY (\`libroId\`) REFERENCES \`libro\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`libros-componentes\` ADD CONSTRAINT \`FK_5760d0fcd362691f284a25b1db5\` FOREIGN KEY (\`componenteId\`) REFERENCES \`componente\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`libro-pedido-especificaciones\` ADD CONSTRAINT \`FK_be9f806317fe4a298fe40b2c4e7\` FOREIGN KEY (\`libroPedidoId\`) REFERENCES \`libro_pedido\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`libro-pedido-especificaciones\` ADD CONSTRAINT \`FK_8ba77c1e2e4ad5516992915d805\` FOREIGN KEY (\`especificacionId\`) REFERENCES \`especificacion\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`libro-pedido-especificaciones\` DROP FOREIGN KEY \`FK_8ba77c1e2e4ad5516992915d805\``);
        await queryRunner.query(`ALTER TABLE \`libro-pedido-especificaciones\` DROP FOREIGN KEY \`FK_be9f806317fe4a298fe40b2c4e7\``);
        await queryRunner.query(`ALTER TABLE \`libros-componentes\` DROP FOREIGN KEY \`FK_5760d0fcd362691f284a25b1db5\``);
        await queryRunner.query(`ALTER TABLE \`libros-componentes\` DROP FOREIGN KEY \`FK_7f96b5c12cdce649fc36cb02c88\``);
        await queryRunner.query(`ALTER TABLE \`propuesta_libro\` DROP FOREIGN KEY \`FK_f7d2b4fef6c4f7f97affe092895\``);
        await queryRunner.query(`ALTER TABLE \`propuesta_libro\` DROP FOREIGN KEY \`FK_e27238f68d12430c8b217d75b40\``);
        await queryRunner.query(`ALTER TABLE \`precio\` DROP FOREIGN KEY \`FK_2dac86d3f8fb74d0b00cb4059b6\``);
        await queryRunner.query(`ALTER TABLE \`cliente\` DROP FOREIGN KEY \`FK_1abba09fd4376b65247f23a4a86\``);
        await queryRunner.query(`ALTER TABLE \`pedido\` DROP FOREIGN KEY \`FK_ab19fb380d17682f87649eded89\``);
        await queryRunner.query(`ALTER TABLE \`pedido\` DROP FOREIGN KEY \`FK_d98ea8b304d7570510076f97d4f\``);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` DROP FOREIGN KEY \`FK_c140a95f89d593aa809f3c2d625\``);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` DROP FOREIGN KEY \`FK_eed9651583ff6570626934b2732\``);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` DROP FOREIGN KEY \`FK_85a659570a49714a2b4c114bf50\``);
        await queryRunner.query(`ALTER TABLE \`libro_pedido\` DROP FOREIGN KEY \`FK_9c6403cb542965d97f87f0f85bf\``);
        await queryRunner.query(`ALTER TABLE \`sede\` DROP FOREIGN KEY \`FK_ad55cec15d1ffe3441c6deb405b\``);
        await queryRunner.query(`ALTER TABLE \`especificacion\` DROP FOREIGN KEY \`FK_3e1296940fe4cfe441750b91b57\``);
        await queryRunner.query(`ALTER TABLE \`libro\` DROP FOREIGN KEY \`FK_c043d014799ea01ed4477868dea\``);
        await queryRunner.query(`ALTER TABLE \`libro\` DROP FOREIGN KEY \`FK_35fc2f43f0fd386365c439ebb84\``);
        await queryRunner.query(`ALTER TABLE \`stock\` DROP FOREIGN KEY \`FK_615791b97541130b41eaa043ddc\``);
        await queryRunner.query(`ALTER TABLE \`stock\` DROP FOREIGN KEY \`FK_55437be5c4e111de5c6c4ec6254\``);
        await queryRunner.query(`ALTER TABLE \`propuesta\` DROP FOREIGN KEY \`FK_3ed763bf276ccce3b303a9914a5\``);
        await queryRunner.query(`ALTER TABLE \`materia\` DROP FOREIGN KEY \`FK_3d001406fff19d17859fb73fc68\``);
        await queryRunner.query(`ALTER TABLE \`componente\` DROP FOREIGN KEY \`FK_103311a0d0ba5c2d7faf2ef6705\``);
        await queryRunner.query(`ALTER TABLE \`cliente_resumen\` DROP FOREIGN KEY \`FK_cadd4795e1e0d2bd32b8d3157dd\``);
        await queryRunner.query(`ALTER TABLE \`cliente_resumen\` DROP FOREIGN KEY \`FK_e95251e7405cf29dcb9d7c9de29\``);
        await queryRunner.query(`DROP INDEX \`IDX_8ba77c1e2e4ad5516992915d80\` ON \`libro-pedido-especificaciones\``);
        await queryRunner.query(`DROP INDEX \`IDX_be9f806317fe4a298fe40b2c4e\` ON \`libro-pedido-especificaciones\``);
        await queryRunner.query(`DROP TABLE \`libro-pedido-especificaciones\``);
        await queryRunner.query(`DROP INDEX \`IDX_5760d0fcd362691f284a25b1db\` ON \`libros-componentes\``);
        await queryRunner.query(`DROP INDEX \`IDX_7f96b5c12cdce649fc36cb02c8\` ON \`libros-componentes\``);
        await queryRunner.query(`DROP TABLE \`libros-componentes\``);
        await queryRunner.query(`DROP INDEX \`IDX_f7d2b4fef6c4f7f97affe09289\` ON \`propuesta_libro\``);
        await queryRunner.query(`DROP INDEX \`IDX_e27238f68d12430c8b217d75b4\` ON \`propuesta_libro\``);
        await queryRunner.query(`DROP TABLE \`propuesta_libro\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`precio\``);
        await queryRunner.query(`DROP INDEX \`IDX_503f81286c5e49acd6a832abf4\` ON \`cliente\``);
        await queryRunner.query(`DROP INDEX \`IDX_9935842e3b6d6ac472cac5916b\` ON \`cliente\``);
        await queryRunner.query(`DROP TABLE \`cliente\``);
        await queryRunner.query(`DROP TABLE \`pedido\``);
        await queryRunner.query(`DROP TABLE \`libro_pedido\``);
        await queryRunner.query(`DROP TABLE \`sede\``);
        await queryRunner.query(`DROP TABLE \`especificacion\``);
        await queryRunner.query(`DROP TABLE \`libro\``);
        await queryRunner.query(`DROP INDEX \`REL_615791b97541130b41eaa043dd\` ON \`stock\``);
        await queryRunner.query(`DROP TABLE \`stock\``);
        await queryRunner.query(`DROP TABLE \`propuesta\``);
        await queryRunner.query(`DROP INDEX \`IDX_3bd07dd70269a7552da82058c5\` ON \`materia\``);
        await queryRunner.query(`DROP TABLE \`materia\``);
        await queryRunner.query(`DROP INDEX \`IDX_f15876494f2d7ec760112f0eea\` ON \`componente\``);
        await queryRunner.query(`DROP TABLE \`componente\``);
        await queryRunner.query(`DROP INDEX \`REL_cadd4795e1e0d2bd32b8d3157d\` ON \`cliente_resumen\``);
        await queryRunner.query(`DROP TABLE \`cliente_resumen\``);
    }

}
