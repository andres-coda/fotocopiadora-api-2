import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1717520000003 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE INDEX idx_libro_pedido_pedido_estado
      ON libro_pedido(pedidoId, estado)
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP INDEX idx_libro_pedido_pedido_estado ON libro_pedido
    `);

  }

}
