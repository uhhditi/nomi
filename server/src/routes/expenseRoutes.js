import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

//Get all expenses for a group
router.get("/:groupId/expenses", async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!groupId) return res.status(400).json({ error: "Invalid groupId" });

  try {
    const { rows } = await pool.query(
      `SELECT expenseid, foodname, price, category, created_at
       FROM expenses
       WHERE group_id = $1
       ORDER BY created_at DESC`,
      [groupId]
    );

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Create a new expense
router.post("/:groupId/expenses", async (req, res) => {
  const groupId = Number(req.params.groupId);
  const { foodname, price, category } = req.body;

  if (!groupId) return res.status(400).json({ error: "Invalid groupId" });
  if (!foodname?.trim())
    return res.status(400).json({ error: "foodname required" });
  if (!price) return res.status(400).json({ error: "price required" });

  try {
    const { rows } = await pool.query(
      `INSERT INTO expenses (group_id, foodname, price, category)
       VALUES ($1, $2, $3, $4)
       RETURNING expenseid, group_id, foodname, price, category, created_at`,
      [groupId, foodname.trim(), price, category || null]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Update an expense
router.put("/:groupId/expenses/:expenseId", async (req, res) => {
  const groupId = Number(req.params.groupId);
  const expenseId = Number(req.params.expenseId);
  const { foodname, price, category } = req.body;

  if (!groupId || !expenseId)
    return res.status(400).json({ error: "Invalid parameters" });

  try {
    const { rows } = await pool.query(
      `UPDATE expenses
       SET foodname = $1, price = $2, category = $3
       WHERE expenseid = $4 AND group_id = $5
       RETURNING expenseid, group_id, foodname, price, category, created_at`,
      [foodname, price, category, expenseId, groupId]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Expense not found" });

    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//Delete an expense
router.delete("/:groupId/expenses/:expenseId", async (req, res) => {
  const groupId = Number(req.params.groupId);
  const expenseId = Number(req.params.expenseId);

  if (!groupId || !expenseId)
    return res.status(400).json({ error: "Invalid parameters" });

  try {
    const result = await pool.query(
      `DELETE FROM expenses
       WHERE expenseid = $1 AND group_id = $2`,
      [expenseId, groupId]
    );

    res.json({ message: "Expense deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
