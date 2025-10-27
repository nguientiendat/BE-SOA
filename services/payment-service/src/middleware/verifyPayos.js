const { createHmac } = require("crypto");

const sortObjDataByKey = (object) => {
  const orderedObject = Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
  return orderedObject;
};

const convertObjToQueryStr = (object) => {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      // Sort nested object
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }
      // Set empty string if null
      if ([null, undefined, "undefined", "null"].includes(value)) {
        value = "";
      }
      return `${key}=${value}`;
    })
    .join("&");
};

const verifyPayOS = async (req, res, next) => {
  try {
    const { data, signature } = req.body;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    console.log(`ChecksumKey : ${checksumKey}}`);
    console.log(`data : ${data.accountNumber}}`);
    console.log(`signature : ${signature}}`);

    if (!data || !signature || !checksumKey) {
      console.warn(
        "Webhook PayOS thiếu 'data', 'signature' hoặc 'checksumKey'."
      );
      return res.status(400).json({ message: "Bad Request: Thiếu dữ liệu" });
    }
    const sortedDataByKey = sortObjDataByKey(data);

    const dataQueryStr = convertObjToQueryStr(sortedDataByKey);

    const calculatedSignature = createHmac("sha256", checksumKey)
      .update(dataQueryStr)
      .digest("hex");
    if (calculatedSignature === signature) {
      console.log("Chữ ký PayOS hợp lệ. Cho phép tiếp tục.");
      next();
    } else {
      console.warn("CẢNH BÁO: Phát hiện chữ ký PayOS không hợp lệ!");
      res.status(401).json({ message: "Unauthorized: Chữ ký không hợp lệ" });
    }
  } catch (error) {
    console.error("Lỗi nghiêm trọng khi xác thực PayOS:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = verifyPayOS;
