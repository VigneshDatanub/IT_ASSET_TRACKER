import asyncHandler from '../utils/asyncHandler.js';
import * as categoryModel from '../models/categoryModel.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel.getAllCategories();
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel.updateCategory(req.params.id, req.body);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel.deleteCategory(req.params.id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, message: 'Category deleted successfully' });
});
