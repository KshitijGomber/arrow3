const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Drone = require('../models/Drone');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Get total counts
    const [totalProducts, totalOrders, totalUsers] = await Promise.all([
      Drone.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' })
    ]);

    // Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate('droneId', 'name')
      .populate('userId', 'firstName lastName')
      .sort({ orderDate: -1 })
      .limit(10)
      .select('_id totalAmount status orderDate customerInfo');

    // Get low stock products (stock < 5)
    const lowStockProducts = await Drone.find({ 
      stockQuantity: { $lt: 5 },
      inStock: true 
    })
      .select('name stockQuantity')
      .sort({ stockQuantity: 1 })
      .limit(10);

    // Get orders by status for charts
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Order.aggregate([
      { 
        $match: { 
          orderDate: { $gte: sixMonthsAgo },
          paymentStatus: 'completed'
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue
        },
        recentOrders: recentOrders.map(order => ({
          id: order._id,
          orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
          customer: order.customerInfo ? 
            `${order.customerInfo.firstName} ${order.customerInfo.lastName}` : 
            'Unknown Customer',
          amount: order.totalAmount,
          status: order.status,
          date: order.orderDate,
          drone: order.droneId?.name || 'Unknown Drone'
        })),
        lowStockProducts: lowStockProducts.map(product => ({
          name: product.name,
          stock: product.stockQuantity
        })),
        charts: {
          ordersByStatus: ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          revenueByMonth: revenueByMonth.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            revenue: item.revenue,
            orders: item.orders
          }))
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics. Please try again.'
    });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Get dashboard alerts
// @access  Private (Admin)
router.get('/alerts', authenticate, authorize('admin'), async (req, res) => {
  try {
    const alerts = [];

    // Check for low stock products
    const lowStockProducts = await Drone.find({ 
      stockQuantity: { $lt: 5 },
      inStock: true 
    }).select('name stockQuantity');

    lowStockProducts.forEach(product => {
      alerts.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name}: ${product.stock} left`,
        action: 'Manage Inventory',
        actionUrl: '/admin/products'
      });
    });

    // Check for pending orders
    const pendingOrdersCount = await Order.countDocuments({ status: 'pending' });
    if (pendingOrdersCount > 0) {
      alerts.push({
        type: 'info',
        title: 'Pending Orders',
        message: `${pendingOrdersCount} orders awaiting confirmation`,
        action: 'View Orders',
        actionUrl: '/admin/orders'
      });
    }

    // System status (always operational for now)
    alerts.push({
      type: 'success',
      title: 'System Status',
      message: 'System running smoothly. All services operational.',
      action: null,
      actionUrl: null
    });

    res.json({
      success: true,
      message: 'Dashboard alerts retrieved successfully',
      data: { alerts }
    });
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard alerts. Please try again.'
    });
  }
});

module.exports = router;