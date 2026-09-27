const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for dev
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  // Mongoose bad ObjectId (CastError - Case 7)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}: '${err.value}'`;
    return res.status(400).json({
      success: false,
      error: message,
      code: 'INVALID_ID',
    });
  }

  // Mongoose Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: ${field} '${err.keyValue[field]}' already exists.`;
    return res.status(400).json({
      success: false,
      error: message,
      code: 'DUPLICATE_KEY',
    });
  }

  // Mongoose Validation Error (Case 8)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({
      success: false,
      error: message,
      code: 'VALIDATION_ERROR',
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
  });
};

export default errorHandler;
