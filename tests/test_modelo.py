"""
Pruebas para modelo.py.

Corren con la libreria estandar (unittest), no hace falta instalar nada.
Desde la raiz del proyecto: python -m unittest discover -s tests -v
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modelo import Materia, Parcial


class TestParcial(unittest.TestCase):
    def test_arranca_sin_aprobar(self):
        p = Parcial("Primer Parcial")
        self.assertFalse(p.aprobado)

    def test_aprobar(self):
        p = Parcial("Primer Parcial")
        p.aprobar()
        self.assertTrue(p.aprobado)

    def test_desaprobar_despues_de_aprobar(self):
        p = Parcial("Primer Parcial")
        p.aprobar()
        p.desaprobar()
        self.assertFalse(p.aprobado)


class TestMateriaEstaCompleta(unittest.TestCase):
    def test_sin_parciales_y_sin_final_esta_completa(self):
        materia = Materia("Analisis Matematico")
        self.assertTrue(materia.esta_completa())

    def test_con_parciales_pendientes_no_esta_completa(self):
        materia = Materia("Sistemas Operativos")
        materia.agregar_parcial("Primer Parcial")
        materia.agregar_parcial("Segundo Parcial")
        self.assertFalse(materia.esta_completa())

    def test_con_todos_los_parciales_aprobados_y_sin_final_esta_completa(self):
        materia = Materia("Sistemas Operativos")
        p1 = materia.agregar_parcial("Primer Parcial")
        p2 = materia.agregar_parcial("Segundo Parcial")
        p1.aprobar()
        p2.aprobar()
        self.assertTrue(materia.esta_completa())

    def test_con_final_pendiente_no_esta_completa(self):
        materia = Materia("Sistemas Operativos", tiene_final=True)
        p1 = materia.agregar_parcial("Primer Parcial")
        p2 = materia.agregar_parcial("Segundo Parcial")
        p1.aprobar()
        p2.aprobar()
        self.assertFalse(materia.esta_completa())

    def test_con_parciales_y_final_aprobados_esta_completa(self):
        materia = Materia("Sistemas Operativos", tiene_final=True)
        p1 = materia.agregar_parcial("Primer Parcial")
        p2 = materia.agregar_parcial("Segundo Parcial")
        p1.aprobar()
        p2.aprobar()
        materia.final_aprobado = True
        self.assertTrue(materia.esta_completa())


if __name__ == "__main__":
    unittest.main()
