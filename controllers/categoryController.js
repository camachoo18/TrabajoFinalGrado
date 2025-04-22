const Category = require('../models/Category');

class CategoryController {
    static async getAll(req, res) {
        try {
            const categories = await Category.getAll();
            res.json(categories);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({ error: 'Error al obtener categorías' });
        }
    }

    static async getById(req, res) {
        try {
            const category = await Category.getById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }
            res.json(category);
        } catch (error) {
            console.error('Error al obtener categoría:', error);
            res.status(500).json({ error: 'Error al obtener categoría' });
        }
    }

    static async create(req, res) {
        try {
            const { nombre } = req.body;
            if (!nombre) {
                return res.status(400).json({ error: 'El nombre es obligatorio' });
            }
            const id = await Category.create(nombre);
            res.status(201).json({ id, nombre });
        } catch (error) {
            console.error('Error al crear categoría:', error);
            res.status(500).json({ error: 'Error al crear categoría' });
        }
    }

    static async update(req, res) {
        try {
            const { nombre } = req.body;
            if (!nombre) {
                return res.status(400).json({ error: 'El nombre es obligatorio' });
            }
            const changes = await Category.update(req.params.id, nombre);
            if (changes === 0) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }
            res.json({ message: 'Categoría actualizada correctamente' });
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            res.status(500).json({ error: 'Error al actualizar categoría' });
        }
    }

    static async delete(req, res) {
        try {
            const changes = await Category.delete(req.params.id);
            if (changes === 0) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }
            res.json({ message: 'Categoría eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            res.status(500).json({ error: 'Error al eliminar categoría' });
        }
    }
}

module.exports = CategoryController; 