import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTriggerClienteResumen1717520000004
  implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE TRIGGER tr_pedido_insert_cliente_resumen
      AFTER INSERT ON pedido
      FOR EACH ROW
      BEGIN

          CASE

              WHEN NEW.estado = 1 THEN
                  UPDATE cliente_resumen
                  SET pendiente = pendiente + 1
                  WHERE cliente_id = NEW.cliente_id;

              WHEN NEW.estado = 2 THEN
                  UPDATE cliente_resumen
                  SET listo = listo + 1
                  WHERE cliente_id = NEW.cliente_id;

              WHEN NEW.estado = 3 THEN
                  UPDATE cliente_resumen
                  SET retirado = retirado + 1
                  WHERE cliente_id = NEW.cliente_id;

              WHEN NEW.estado = 4 THEN
                  UPDATE cliente_resumen
                  SET cancelado = cancelado + 1
                  WHERE cliente_id = NEW.cliente_id;

          END CASE;

      END
    `);

    await queryRunner.query(`
      CREATE TRIGGER tr_pedido_update_cliente_resumen
      AFTER UPDATE ON pedido
      FOR EACH ROW
      BEGIN

          IF OLD.estado <> NEW.estado THEN

              CASE

                  WHEN OLD.estado = 1 THEN
                      UPDATE cliente_resumen
                      SET pendiente = GREATEST(pendiente - 1, 0)
                      WHERE cliente_id = OLD.cliente_id;

                  WHEN OLD.estado = 2 THEN
                      UPDATE cliente_resumen
                      SET listo = GREATEST(listo - 1, 0)
                      WHERE cliente_id = OLD.cliente_id;

                  WHEN OLD.estado = 3 THEN
                      UPDATE cliente_resumen
                      SET retirado = GREATEST(retirado - 1, 0)
                      WHERE cliente_id = OLD.cliente_id;

                  WHEN OLD.estado = 4 THEN
                      UPDATE cliente_resumen
                      SET cancelado = GREATEST(cancelado - 1, 0)
                      WHERE cliente_id = OLD.cliente_id;

              END CASE;

              CASE

                  WHEN NEW.estado = 1 THEN
                      UPDATE cliente_resumen
                      SET pendiente = pendiente + 1
                      WHERE cliente_id = NEW.cliente_id;

                  WHEN NEW.estado = 2 THEN
                      UPDATE cliente_resumen
                      SET listo = listo + 1
                      WHERE cliente_id = NEW.cliente_id;

                  WHEN NEW.estado = 3 THEN
                      UPDATE cliente_resumen
                      SET retirado = retirado + 1
                      WHERE cliente_id = NEW.cliente_id;

                  WHEN NEW.estado = 4 THEN
                      UPDATE cliente_resumen
                      SET cancelado = cancelado + 1
                      WHERE cliente_id = NEW.cliente_id;

              END CASE;

          END IF;

      END
    `);

    await queryRunner.query(`
      CREATE TRIGGER tr_pedido_delete_cliente_resumen
      AFTER DELETE ON pedido
      FOR EACH ROW
      BEGIN

          CASE

              WHEN OLD.estado = 1 THEN
                  UPDATE cliente_resumen
                  SET pendiente = GREATEST(pendiente - 1, 0)
                  WHERE cliente_id = OLD.cliente_id;

              WHEN OLD.estado = 2 THEN
                  UPDATE cliente_resumen
                  SET listo = GREATEST(listo - 1, 0)
                  WHERE cliente_id = OLD.cliente_id;

              WHEN OLD.estado = 3 THEN
                  UPDATE cliente_resumen
                  SET retirado = GREATEST(retirado - 1, 0)
                  WHERE cliente_id = OLD.cliente_id;

              WHEN OLD.estado = 4 THEN
                  UPDATE cliente_resumen
                  SET cancelado = GREATEST(cancelado - 1, 0)
                  WHERE cliente_id = OLD.cliente_id;

          END CASE;

      END
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tr_pedido_insert_cliente_resumen
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tr_pedido_update_cliente_resumen
    `);

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tr_pedido_delete_cliente_resumen
    `);

  }

}
