import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTriggerPedido1717520000001 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE TRIGGER tr_libro_pedido_update_pedido
      AFTER UPDATE ON libro_pedido
      FOR EACH ROW
      BEGIN

          DECLARE v_pendientes INT DEFAULT 0;
          DECLARE v_listos INT DEFAULT 0;
          DECLARE v_retirados INT DEFAULT 0;
          DECLARE v_cancelados INT DEFAULT 0;
          DECLARE v_total INT DEFAULT 0;

          DECLARE v_estado_pedido TINYINT;

          IF OLD.estado <> NEW.estado THEN

              SELECT
                  COUNT(*),

                  SUM(
                      CASE
                          WHEN estado IN (0,1,2) THEN 1
                          ELSE 0
                      END
                  ),

                  SUM(
                      CASE
                          WHEN estado = 3 THEN 1
                          ELSE 0
                      END
                  ),

                  SUM(
                      CASE
                          WHEN estado = 4 THEN 1
                          ELSE 0
                      END
                  ),

                  SUM(
                      CASE
                          WHEN estado = 5 THEN 1
                          ELSE 0
                      END
                  )

              INTO
                  v_total,
                  v_pendientes,
                  v_listos,
                  v_retirados,
                  v_cancelados

              FROM libro_pedido
              WHERE pedidoId = NEW.pedidoId;

              IF v_pendientes > 0 THEN
                  SET v_estado_pedido = 0;

              ELSEIF v_listos > 0 THEN
                  SET v_estado_pedido = 3;

              ELSEIF v_retirados = v_total THEN
                  SET v_estado_pedido = 4;

              ELSEIF v_cancelados = v_total THEN
                  SET v_estado_pedido = 5;

              END IF;

              UPDATE pedido
              SET estado = v_estado_pedido
              WHERE id = NEW.pedidoId;

          END IF;

      END
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tr_libro_pedido_update_pedido
    `);

  }

}
