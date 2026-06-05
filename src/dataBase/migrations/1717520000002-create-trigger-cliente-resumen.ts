import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTriggerClienteResumen1717520000004
  implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE TRIGGER tr_pedido_update_cliente_resumen
      AFTER UPDATE ON pedido
      FOR EACH ROW
BEGIN

          IF OLD.estado <> NEW.estado THEN

--RESTAR ESTADO ANTERIOR

CASE

                  WHEN OLD.estado IN(0, 1, 2) THEN
                      UPDATE cliente_resumen
                      SET pendientes = GREATEST(pendientes - 1, 0)
                      WHERE clienteId = OLD.clienteId;

                  WHEN OLD.estado = 3 THEN
                      UPDATE cliente_resumen
                      SET listos = GREATEST(listos - 1, 0)
                      WHERE clienteId = OLD.clienteId;

                  WHEN OLD.estado = 4 THEN
                      UPDATE cliente_resumen
                      SET retirados = GREATEST(retirados - 1, 0)
                      WHERE clienteId = OLD.clienteId;

                  WHEN OLD.estado = 5 THEN
                      UPDATE cliente_resumen
                      SET cancelados = GREATEST(cancelados - 1, 0)
                      WHERE clienteId = OLD.clienteId;

              END CASE;

--SUMAR ESTADO NUEVO

CASE

                  WHEN NEW.estado IN(0, 1, 2) THEN
                      UPDATE cliente_resumen
                      SET pendientes = pendientes + 1
                      WHERE clienteId = NEW.clienteId;

                  WHEN NEW.estado = 3 THEN
                      UPDATE cliente_resumen
                      SET listos = listos + 1
                      WHERE clienteId = NEW.clienteId;

                  WHEN NEW.estado = 4 THEN
                      UPDATE cliente_resumen
                      SET retirados = retirados + 1
                      WHERE clienteId = NEW.clienteId;

                  WHEN NEW.estado = 5 THEN
                      UPDATE cliente_resumen
                      SET cancelados = cancelados + 1
                      WHERE clienteId = NEW.clienteId;

              END CASE;

          END IF;

END
  `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tr_pedido_update_cliente_resumen
  `);

  }

}
