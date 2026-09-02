import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zokep_crm_super_secure_jwt_secret_key_2026_dev');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: user.deactivationReason
          ? `Account suspended: ${user.deactivationReason}`
          : 'Your account has been deactivated by administrator. Please contact support.',
        isDeactivated: true,
      });
    }

    // Attach user to request
    req.user = user;

    // Attach tenantId:
    // If Admin: tenantId is user._id
    // If Staff: tenantId is user.tenantId
    // If Super Admin: tenantId is null
    if (user.role === 'admin') {
      req.tenantId = user._id;
    } else if (user.role === 'staff') {
      req.tenantId = user.tenantId;
    } else {
      req.tenantId = null;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid or expired token.',
    });
  }
};
