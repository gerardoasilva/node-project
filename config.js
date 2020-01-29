// mongodb://localhost/university
// mongodb+srv://universityuser:universityuser@cluster0-xilgz.mongodb.net/university?retryWrites=true&w=majority
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb+srv://universityuser:universityuser@cluster0-xilgz.mongodb.net/university?retryWrites=true&w=majority";

exports.PORT = process.env.PORT || 8080; 