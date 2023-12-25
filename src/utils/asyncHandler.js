const asyncHandler = (requesHandler) => {
  return (req, res, next) => {
    Promise.resolve(requesHandler(req,res,next))
    .catch((error)=>next(error))
  };
};

export { asyncHandler };

/*
const asyncHandler = (fun) => async (req, res, next) => {
  try {

  } catch (error) {
    res.status(error.code || 500).json({
        success:false,
        message:error.message
    })
  }
};
*/