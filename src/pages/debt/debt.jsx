import { Table, Button, Select, Input, message } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./debt.css";
import moment from "moment";
import { IoMdBackspace } from "react-icons/io";

export default function Debt() {
  const [sold, setSold] = useState([]);
  const [filteredSold, setFilteredSold] = useState([]);
  const [filter, setFilter] = useState("sold");
  const [paymentAmount, setPaymentAmount] = useState({});
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    refreshSoldData();
  }, [filter]);

  useEffect(() => {
    const filtered = sold.filter((item) => {
      if (item.fullname) {
        return item.fullname.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
    setFilteredSold(filtered);
  }, [searchQuery, sold]);

  const columns = [
    {
      title: "Ismi",
      dataIndex: "fullname",
      key: "fullname",
      render: (text) => text || "Ma'lumot topilmadi", // Display default message if empty
    },
    {
      title: "Manzili",
      dataIndex: "address",
      key: "address",
      render: (text) => text || "Ma'lumot topilmadi", // Display default message if empty
    },
    {
      title: "Telefon",
      dataIndex: "phone",
      key: "phone",
      render: (text) => text || "Ma'lumot topilmadi", // Display default message if empty
    },
    {
      title: "Sotilgan Mahsulotlar",
      key: "products",
      render: (_, record) => (
        <div>
          {record.totalProduct?.length > 0
            ? record.totalProduct.map((product, index) => (
              <p key={index}>
                {product.name} - {product.quantity} ta
              </p>
            ))
            : "Ma'lumot topilmadi"}
        </div>
      ),
    },
    // {
    //   title: "Valyuta",
    //   key: "currency",
    //   render: (_, record) => (
    //     <p>{record.currency === "sum" ? "so'm" : "$"}</p> // Display currency symbol
    //   ),
    // },
    {
      title: filter === "debt" ? "Umumiy Qarzi" : "Umumiy To'lov",
      key: "totaldebt",
      render: (_, record) => (
        <p>
          {record.paymentAmount?.toLocaleString() || "Ma'lumot topilmadi"}{" "}
          {record.currency === "sum" ? "so'm" : "$"} {/* Display currency symbol */}
          {filter === "debt" && record.paymentAmount && (
            <span style={{ color: "red" }}>
              {" "}
              (Qolgan: {(
                record.paymentAmount - (record.paidAmount || 0)
              )?.toLocaleString()}{" "}
              {record.currency === "sum" ? "so'm" : "$"}) {/* Display currency symbol */}
            </span>
          )}
        </p>
      ),
    },
    {
      title: "Sanasi",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) =>
        text ? moment(text).format("YYYY,MM,DD HH:mm") : "Ma'lumot topilmadi",
    },
    {
      title: filter === "debt" ? "To'lovni kiritish" : "",
      key: "payment",
      render: (_, record) =>
        filter === "debt" && (
          <div>
            <Input
              type="number"
              value={paymentAmount[record._id] || ""}
              onChange={(e) => handleInputChange(e, record._id)}
              style={{ width: "120px", marginRight: "10px" }}
            />
            <Button
              type="primary"
              onClick={() => handlePayment(record._id)}
              style={{ marginTop: "10px" }}
            >
              To'lov qilish
            </Button>
          </div>
        ),
    },
  ];


  const handleInputChange = (e, id) => {
    setPaymentAmount({
      ...paymentAmount,
      [id]: e.target.value,
    });
  };

  const handlePayment = (id) => {
    const amount = paymentAmount[id];
    if (amount) {
      axios
        .post(`https://stomatology-web-server.vercel.app/api/payment`, {
          userId: id,
          amount: parseFloat(amount),
        })
        .then((res) => {
          message.success("To'lov muvaffaqiyatli amalga oshirildi!");
          setPaymentAmount((prev) => ({
            ...prev,
            [id]: "",
          }));
          refreshSoldData();
        })
        .catch((err) => {
          console.error("To'lovda xatolik yuz berdi:", err);
          message.error(
            "To'lovda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
          );
        });
    } else {
      message.warning("Iltimos, to'lov summasini kiriting.");
    }
  };

  const refreshSoldData = () => {
    let url = "https://stomatology-web-server.vercel.app/api/sold";
    if (filter === "debt") {
      url += "?debt=true";
    }

    axios
      .get(url)
      .then((res) => setSold(res.data))
      .catch((err) => console.error(err));
  };

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  return (
    <div className="debt-container">
      <div className="navbar">
        <Button type="primary" onClick={() => navigate("/")}>
          <IoMdBackspace /> Orqaga
        </Button>
        <Input
          type="text"
          placeholder="Qidirish"
          style={{ width: "220px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          defaultValue="sold"
          style={{ width: 200 }}
          onChange={handleFilterChange}
          options={[
            { value: "sold", label: "Sotuv" },
            { value: "debt", label: "Qarzdorlar" },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredSold}
        rowKey={"_id"}
        locale={{
          emptyText: "Ma'lumot topilmadi", // Custom empty text
        }}
      />
    </div>
  );
}