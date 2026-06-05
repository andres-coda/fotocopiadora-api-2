import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTriggerStock1717520000002 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE TRIGGER tr_libro_pedido_update_stock
      AFTER UPDATE ON libro_pedido
      FOR EACH ROW
      BEGIN

          IF OLD.estado <> NEW.estado THEN

              -- RESTAR ESTADO ANTERIOR

              CASE

                  WHEN OLD.estado IN (0,1,2) THEN
                      UPDATE stock
                      SET pendiente = GREATEST(pendiente - OLD.cantidad, 0)
                      WHERE libro_id = OLD.libroId;

                  WHEN OLD.estado = 3 THEN
                      UPDATE stock
                      SET listo = GREATEST(listo - OLD.cantidad, 0)
                      WHERE libro_id = OLD.libroId;

                  WHEN OLD.estado = 4 THEN
                      UPDATE stock
                      SET retirado = GREATEST(retirado - OLD.cantidad, 0)
                      WHERE libro_id = OLD.libroId;

                  WHEN OLD.estado = 5 THEN
                      UPDATE stock
                      SET cancelado = GREATEST(cancelado - OLD.cantidad, 0)
                      WHERE libro_id = OLD.libroId;

                  WHEN OLD.estado = 6 THEN
                      UPDATE stock
                      SET stock = GREATEST(stock - OLD.cantidad, 0)
                      WHERE libro_id = OLD.libroId;

              END CASE;

              -- SUMAR ESTADO NUEVO

              CASE

                  WHEN NEW.estado IN (0,1,2) THEN
                      UPDATE stock
                      SET pendiente = pendiente + NEW.cantidad
                      WHERE libro_id = NEW.libroId;

                  WHEN NEW.estado = 3 THEN
                      UPDATE stock
                      SET listo = listo + NEW.cantidad
                      WHERE libro_id = NEW.libroId;

                  WHEN NEW.estado = 4 THEN
                      UPDATE stock
                      SET retirado = retirado + NEW.cantidad
                      WHERE libro_id = NEW.libroId;

                  WHEN NEW.estado = 5 THEN
                      UPDATE stock
                      SET cancelado = cancelado + NEW.cantidad
                      WHERE libro_id = NEW.libroId;

                  WHEN NEW.estado = 6 THEN
                      UPDATE stock
                      SET stock = stock + NEW.cantidad
                      WHERE libro_id = NEW.libroId;

              END CASE;

          END IF;

      END
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      DROP TRIGGER IF EXISTS tr_libro_pedido_update_stock
    `);

  }

}
