"""
modelo.py
---------
Acá vive la LOGICA del sistema de puntos. Nada de ventanas todavia,
solo las "clases" que representan los datos: Materia, Parcial y Premio.

Una CLASE en Python es como un "molde" para crear objetos. Por ejemplo,
la clase Materia es el molde, y "Sistemas Operativos" o "Lenguajes Formales"
serian objetos creados con ese molde.
"""


class Parcial:
    """Representa un parcial dentro de una materia."""

    def __init__(self, nombre, puntos=10):
        # __init__ es el "constructor": se ejecuta automaticamente
        # cada vez que creamos un Parcial nuevo.
        self.nombre = nombre
        self.puntos = puntos       # cuantos puntos otorga si se aprueba
        self.aprobado = False      # arranca sin aprobar

    def aprobar(self):
        self.aprobado = True

    def desaprobar(self):
        # Por si te equivocaste al tildarlo, o rendiste de nuevo
        self.aprobado = False


class Materia:
    """Representa una materia del plan de estudio."""

    def __init__(self, nombre, tiene_final=False, puntos_final=20, puntos_materia=15):
        self.nombre = nombre
        self.parciales = []              # lista vacia de objetos Parcial
        self.tiene_final = tiene_final    # True si hay que rendir final
        self.final_aprobado = False
        self.puntos_final = puntos_final
        self.puntos_materia = puntos_materia  # puntos por completar TODA la materia
        self.materia_completa = False

    def agregar_parcial(self, nombre_parcial, puntos=10):
        nuevo = Parcial(nombre_parcial, puntos)
        self.parciales.append(nuevo)
        return nuevo

    def esta_completa(self):
        """
        Una materia esta completa si:
        - todos los parciales estan aprobados, Y
        - si tiene final, el final tambien esta aprobado.
        """
        todos_parciales_ok = all(p.aprobado for p in self.parciales)
        if self.tiene_final:
            return todos_parciales_ok and self.final_aprobado
        return todos_parciales_ok


if __name__ == "__main__":
    # Este bloque solo se ejecuta si corremos ESTE archivo directamente
    # (no si lo importamos desde otro lado). Lo usamos para probar rapido.
    print("Probando el modelo...\n")

    so = Materia("Sistemas Operativos", tiene_final=True)
    p1 = so.agregar_parcial("Primer Parcial")
    p2 = so.agregar_parcial("Segundo Parcial")

    print(f"{so.nombre} - completa? {so.esta_completa()}")

    p1.aprobar()
    p2.aprobar()
    so.final_aprobado = True

    print(f"{so.nombre} - completa? {so.esta_completa()}")