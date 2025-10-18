const Grant = require('../models/Grant');

// Mock данные (временные)
const mockGrants = [
  new Grant(1, "Поддержка социальных проектов", "Грант для некоммерческих организаций", "Социальная сфера", "open", "2025-03-15", "2 000 000 ₽", 245),
  new Grant(2, "Развитие культурных инициатив", "Финансирование проектов в области культуры", "Культура", "closing_soon", "2025-02-28", "5 000 000 ₽", 89)
];

const grantController = {
  // Получить все гранты
  getAllGrants: (req, res) => {
    try {
      res.json({
        success: true,
        data: mockGrants,
        count: mockGrants.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching grants'
      });
    }
  },

  // Получить грант по ID (заглушка)
  getGrantById: (req, res) => {
    try {
      // TODO: Реализовать поиск по ID
      res.json({
        success: true,
        message: 'Grant by ID endpoint - to be implemented',
        grantId: req.params.id
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching grant'
      });
    }
  },

  // Создать грант (заглушка)
  createGrant: (req, res) => {
    try {
      // TODO: Реализовать создание гранта
      res.json({
        success: true,
        message: 'Create grant endpoint - to be implemented'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating grant'
      });
    }
  }
};

module.exports = grantController;