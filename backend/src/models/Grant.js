// Модель гранта (заглушка для будущей БД)
class Grant {
  constructor(id, title, description, category, status, deadline, budget, applications) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.status = status;
    this.deadline = deadline;
    this.budget = budget;
    this.applications = applications;
  }
}

module.exports = Grant;