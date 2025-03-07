import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Form, Input, Button, Checkbox, Select } from "antd"; // Added Select
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "./style.css";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import imageSrc from "../../../assets/kul.png";

const Kassa = () => {
  const [products, setProducts] = useState([]);
  const [basket, setBasket] = useState([]);
  const barcodeRef = useRef();
  const [total, setTotal] = useState(0);
  const [totalDollar, setTotalDollar] = useState(0); // Added for dollar total
  const [minTotal, setMinTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [clientSum, setClientSum] = useState();
  const [debt, setDebt] = useState(false);
  const [form] = Form.useForm();
  const [currency, setCurrency] = useState("sum"); // Added currency state
  const [exchangeRate, setExchangeRate] = useState(12000); // Example exchange rate (1 USD = 12000 UZS)

  const [arzon, setArzon] = useState(null);

  useEffect(() => {
    setClientSum(
      basket.reduce((a, b) => a + b.sellingPrice * b.sellingQuantity, 0)
    );
  }, [basket]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, []);

  const barcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(
      (product) => product.brCode === barcodeRef.current.value
    );
    if (product) {
      product.sellingQuantity = 1;
      setBasket([...basket, product]);
      barcodeRef.current.value = "";
    }
  };

  useEffect(() => {
    const newTotal = basket.reduce(
      (acc, product) => acc + product.sellingPrice * product.sellingQuantity,
      0
    );
    const newMinTotal = basket.reduce(
      (acc, product) => acc + product.middlePrice * product.sellingQuantity,
      0
    );
    setTotal(newTotal);
    setMinTotal(newMinTotal);
    setTotalDollar(newTotal / exchangeRate); // Convert total to dollars
  }, [basket, exchangeRate]);

  const plus = (id) => {
    setBasket((prevBasket) =>
      prevBasket.map((product) =>
        product._id === id
          ? {
            ...product,
            sellingQuantity: Math.min(
              product.sellingQuantity + 1,
              product.quantity
            ),
          }
          : product
      )
    );
  };

  const minus = (id) => {
    setBasket((prevBasket) =>
      prevBasket.map((product) =>
        product._id === id
          ? {
            ...product,
            sellingQuantity: Math.max(product.sellingQuantity - 1, 1),
          }
          : product
      )
    );
  };

  const deleteItem = (id) => {
    setBasket((prevBasket) =>
      prevBasket.filter((product) => product._id !== id)
    );
  };

  const printCheck = () => {
    const printWindow = window.open("", "", "height=auto,width=80mm");

    printWindow.document.write(`
    <html>
      <head>
        <title>Check</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            width: 80mm;
            text-align: center;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          h2, p {
            text-align: center;
          }
          .end {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-inline: 12px;
          }
          #yulduzcha {
            font-size: 22px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>Sotuv cheki</h1>
        <p id="yulduzcha">**************************************</p>
        <div class="products">
  `);
    basket.forEach((product, index) => {
      printWindow.document.write(`
        <p style="text-align: left; margin-left:9px;">${index + 1}. ${product.name
        }</p>
        <div class="end">
        <p>${product.sellingQuantity} * ${product.sellingPrice} </p>
        <p>= ${product.sellingPrice * product.sellingQuantity} so'm </p>
        </div>
    `);
    });
    printWindow.document.write(`
        </div>
        <p style="font-size: 30px"><strong style="font-size: 30px">Jami:</strong> ${total} so'm</p>
        <p id="yulduzcha">***************************************</p>
        <div class="end">
          <p>
          ${`${String(new Date().getDate()).padStart(2, "0")}.${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}.${new Date().getFullYear()}`}
          </p>
          <p>
          ${String(new Date().getHours()).padStart(2, "0")}:${String(
      new Date().getMinutes()
    ).padStart(2, "0")}
          </p>
        </div>
        <p>tel:+998936764994</p>
        <p>Xaridingiz uchun rahmat!</p>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const submitData = (values, resetForm) => {
    if (!debt) {
      if (clientSum < minTotal) {
        setArzon("Pul miqdori kam");
        return;
      }
    }
    if (debt) {
      values.totaldebt = clientSum;
    } else {
      values.totaldebt = null;
    }
    values.debt = debt;
    values.currency = currency; // Add currency to the request
    values.totalProduct = basket.map((i) => ({
      name: i.name,
      quantity: i.sellingQuantity,
      sellingPrice: i.sellingPrice,
      purchasePrice: i.purchasePrice,
    }));

    if (window.confirm("Sotuvni tasdiqlaysizmi?")) {
      axios
        .post("https://stomatology-web-server.vercel.app/api/sold", values)
        .then((response) => {
          basket.forEach((product) => {
            axios
              .put(`https://stomatology-web-server.vercel.app/api/products/${product._id}`, {
                quantity: product.quantity - product.sellingQuantity,
              })
              .catch((error) => console.log(error));
          });
          setBasket([]);
          setArzon(null);
          setTotal(0);
          setTotalDollar(0);
          printCheck();
          setVisible(false);
          setClientSum(0);
          form.resetFields();
          resetForm();
        })
        .catch((error) => console.log(error));
    }
  };

  return (
    <div className="kassa_wrapper">
      <Rodal height={550} visible={visible} onClose={() => setVisible(false)}>
        <div style={{ padding: "20px" }}>
          <h3>Foydalanuvchi ma'lumotlari</h3>
     <Form
  form={form}
  layout="vertical"
  onFinish={submitData}
  initialValues={{
    fullname: "",
    address: "",
    phone: "",
    paymentAmount: "",
  }}
>
  <Form.Item
    label={debt ? "Qarz summasi" : "To'lov summasi"}
    name="paymentAmount"
    rules={[{ required: true, message: "To'lov summasini kiriting!" }]}
  >
    <Input
      style={!arzon ? {} : { border: "1px solid red" }}
      type="number"
      onChange={(e) => {
        // Update clientSum based on the selected currency
        const value = parseFloat(e.target.value);
        if (currency === "sum") {
          setClientSum(value); // If currency is sum, use the value directly
        } else {
          setClientSum(value * exchangeRate); // If currency is dollar, convert to sum
        }
      }}
      value={
        currency === "sum"
          ? clientSum
          : (clientSum / exchangeRate).toFixed(2) // Convert sum to dollars for display
      }
      placeholder={debt ? "Qarz summasi" : "To'lov summasi"}
    />
    {arzon && <p style={{ color: "red" }}>{arzon}</p>}
  </Form.Item>

  <Form.Item label="Valyuta" name="currency">
    <Select
      defaultValue="sum"
      onChange={(value) => {
        setCurrency(value); // Update the selected currency
        // Convert clientSum when currency changes
        if (value === "sum") {
          setClientSum(total); // Set clientSum to total in sum
        } else {
          setClientSum(total / exchangeRate); // Convert total to dollars
        }
      }}
    >
      <Select.Option value="sum">So'm</Select.Option>
      <Select.Option value="dollar">Dollar</Select.Option>
    </Select>
  </Form.Item>

  <label
    style={{ display: "flex", gap: "6px", marginBottom: "12px" }}
    htmlFor="debt"
  >
    <p>Qarz</p>
    <Checkbox id="debt" value={debt} onChange={() => setDebt(!debt)} />
  </label>

  {debt && (
    <>
      <Form.Item
        label="Ism"
        name="fullname"
        rules={[{ required: true, message: "Ismni kiriting!" }]}
      >
        <Input placeholder="Ismingizni kiriting" />
      </Form.Item>

      <Form.Item
        label="Manzil"
        name="address"
        rules={[{ required: true, message: "Manzilni kiriting!" }]}
      >
        <Input placeholder="Manzilingizni kiriting" />
      </Form.Item>

      <Form.Item
        label="Telefon"
        name="phone"
        rules={[
          {
            required: true,
            message: "Telefon raqamingizni kiriting!",
          },
        ]}
      >
        <Input placeholder="Telefon raqamingiz" />
      </Form.Item>
    </>
  )}

  <Form.Item>
    <Button type="primary" htmlType="submit" block>
      Yuborish
    </Button>
  </Form.Item>
</Form>
        </div>
      </Rodal>

      <form onSubmit={barcodeSubmit} className="kassa_head">
        <input ref={barcodeRef} autoFocus type="text" />
        <button>Yuborish</button>
      </form>

      <div className="kassa_body">
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Nº</Th>
                <Th>Nomi</Th>
                <Th>Sotish narxi (So'm)</Th>
                <Th>Sotish narxi ($)</Th>
                <Th>Minimal narx (So'm)</Th>
                <Th>Minimal narx ($)</Th> {/* Added new column */}
                <Th>Sotilayotgan soni</Th>
                <Th>Kategoriya</Th>
                <Th>O'chirish</Th>
              </Tr>
            </Thead>
            <Tbody>
              {basket.length > 0 ? (
                basket.map((product, index) => (
                  <Tr key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{product.name}</Td>
                    <Td>{product.sellingPriceSum?.toLocaleString() || "0"} so'm</Td>
                    <Td>{product.sellingPriceDollar?.toLocaleString() || "0"} $</Td>
                    <Td>{product.middlePriceSum?.toLocaleString() || "0"} so'm</Td>
                    <Td>{product.middlePriceDollar?.toLocaleString() || "0"} $</Td> {/* Added new column */}
                    <Td id="quantity">
                      <button onClick={() => minus(product._id)}>-</button>
                      {product.sellingQuantity}
                      <button id="plus" onClick={() => plus(product._id)}>
                        +
                      </button>
                    </Td>
                    <Td>{product.category}</Td>
                    <Td>
                      <button onClick={() => deleteItem(product._id)}>O'chirish</button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="9">Sotilayotgan mahsulotlar yo'q</Td> {/* Updated colSpan to 9 */}
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </div>

      <div className="kassa_footer">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            textAlign: "left",
            alignItems: "start",
            justifyContent: "start",
          }}
          className="text"
        >
          <b>Jami to'lov: {total} so'm</b>
          <b>Jami to'lov ($): {totalDollar.toFixed(2)} $</b>
          <b>Minimal to'lov: {minTotal} so'm</b>
        </div>
        <button onClick={() => setVisible(true)}>Sotish</button>
      </div>
    </div>
  );
};

export default Kassa;