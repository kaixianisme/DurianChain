// Import dependencies
const bcrypt = require("bcrypt");

(async () => {
    // Hash the password
    const salt = await bcrypt.genSalt(15);
    console.log(await bcrypt.hash("durian123", salt));
})();