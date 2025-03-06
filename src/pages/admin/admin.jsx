import "./admin.css";
import { Table } from "../../components/table/table";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useEditProductMutation,
} from "../../context/service/addproduct.service";
import { PageHeader } from "../../components/page_header/page_header";
import { IoClose, IoPencil, IoTrash } from "react-icons/io5";
import { CloseModal } from "../../utils/closemodal";
import { useForm } from "react-hook-form";
import JsBarcode from "jsbarcode";
import { BsQrCode } from "react-icons/bs";

import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuHistory } from "react-icons/lu";
import Input from "antd/es/input/Input";

export const Admin = () => {
  const { data: products = [], refetch } = useGetAllProductsQuery();
  const [createProduct] = useCreateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [upDateProduct] = useEditProductMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState("");
  const generateUniqueId = require("generate-unique-id");
  const barcodeRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(""); // Qidiruv uchun state

  const toggleEditModal = () => setIsEditModalOpen(!isEditModalOpen);
  const toggleBarcodeModal = () => setIsBarcodeModalOpen(!isBarcodeModalOpen);
  const addAdminModalRef = useRef(null);
  const editAdminModalRef = useRef(null);
  const barcodeModalRef = useRef(null);
  const [editingItem, setEditingItem] = useState(null);
  const brCodeRef = useRef();
  const nameRef = useRef();
  const purchasePriceRef = useRef();
  const middlePriceRef = useRef();
  const sellingPriceRef = useRef();
  const quantityRef = useRef();
  const categoryRef = useRef();
  const navigate = useNavigate();
  const [name, setName] = useState(null);

  const barcode = generateUniqueId({
    length: 8,
    useLetters: false,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const toggleModal = () => {
    setIsOpen(!isOpen);
    setEditingItem(null);
  };

  CloseModal({ modalRef: addAdminModalRef, onClose: () => setIsOpen(false) });
  CloseModal({
    modalRef: editAdminModalRef,
    onClose: () => setIsEditModalOpen(false),
  });
  CloseModal({
    modalRef: barcodeModalRef,
    onClose: () => setIsBarcodeModalOpen(false),
  });

  useEffect(() => {
    if (barcodeRef.current && barcodeValue) {
      JsBarcode(barcodeRef.current, barcodeValue, {
        format: "CODE128",
        width: 2.4,
        height: 100,
        displayValue: true,
      });
    }
  }, [barcodeValue]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      brCode: brCodeRef.current.value,
      name: nameRef.current.value,
      purchasePrice: parseFloat(purchasePriceRef.current.value),
      middlePrice: parseFloat(middlePriceRef.current.value),
      sellingPrice: parseFloat(sellingPriceRef.current.value),
      quantity: parseFloat(quantityRef.current.value),
      category: categoryRef.current.value,
      artikul: new Date(),
    };

    try {
      if (editingItem) {
        await upDateProduct({ id: editProductId, data }).unwrap();
        setEditingItem(null);
        setEditProductId(null);
      } else {
        await createProduct(data).unwrap();
      }

      reset();
      refetch();
      setIsOpen(false);
      setIsEditModalOpen(false);
      e.target.reset();
    } catch (error) {
      console.error("Error adding/updating product:", error);
      alert(
        "Mahsulot qo'shishda xato yuz berdi. Iltimos, qaytadan urinib ko'ring."
      );
    }
  };

  const handleEdit = (productId) => {
    const product = products.find((product) => product._id === productId);
    if (product) {
      setEditProductId(productId);
      setEditingItem(product);
      setIsOpen(true);
    }
  };

  const handleDelete = async (productId) => {
    console.log(productId);
    const confirm = window.confirm("Mahsulotni o'chirmoqchimisiz?");
    if (confirm) {
      try {
        await deleteProduct(productId).unwrap();
        refetch();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleBarcode = (productId) => {
    const product = products.find((prod) => prod._id === productId);
    const name = product?.name;
    const sellingPrice = product?.sellingPrice;
    if (product) {
      setBarcodeValue(product.brCode);
      setName({ name, sellingPrice });
      toggleBarcodeModal();
    }
  };

  const handlePrint = () => {
    window.print(<p>salom</p>);
    toggleBarcodeModal(false);
  };

  const totalProfit = products.reduce((acc, product) => {
    return (
      acc + (product.sellingPrice - product.purchasePrice) * product.quantity
    );
  }, 0);

  // Qidiruv funksiyasi
  const filteredProducts = products.filter((product) =>
    product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Fragment>
      <div className="page">
        <PageHeader title="Admin">
          <Input
            type="text"
            placeholder="Qidirish"
            style={{ width: "220px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button id="debt_button" onClick={() => navigate("/debt")}>
            Sotuv Tarixi <LuHistory />
          </button>
          <button className="btn" onClick={toggleModal}>
            Yangi mahsulot qo'shish +
          </button>
        </PageHeader>

        <Table>
          <thead>
            <tr>
              <th>№</th>
              <th>Barcode</th>
              <th>Mahsulot nomi</th>
              <th>Kelgan narxi</th>
              <th>Minimal narxi</th>
              <th>Sotish narxi</th>
              <th>Foyda</th>
              <th>Kirim soni</th>
              <th>Kategoriya</th>
              <th>Tahrirlash</th>
              <th>Barcode</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr
                style={
                  product.quantity < 6 ? { backgroundColor: "#FFCCE5" } : {}
                }
                key={product?._id}
              >
                <td>{index + 1}</td>
                <td>{product?.brCode}</td>
                <td>{product?.name}</td>
                <td>{product?.purchasePrice.toLocaleString()} so'm</td>
                <td>{product?.middlePrice.toLocaleString()} so'm</td>
                <td>{product?.sellingPrice.toLocaleString()} so'm</td>
                <td>
                  {(
                    (product?.sellingPrice - product?.purchasePrice) *
                    product?.quantity
                  ).toLocaleString()}{" "}
                  so'm
                </td>
                <td>{product?.quantity}</td>
                <td>{product?.category}</td>
                <td className="tdd">
                  <button
                    onClick={() => handleEdit(product?._id)}
                    className="btn-edit"
                  >
                    <IoPencil />
                  </button>
                  <button
                    onClick={() => handleDelete(product?._id)}
                    className="btn-delete"
                  >
                    <IoTrash />
                  </button>
                </td>
                <td>
                  <button
                    id="barcode"
                    onClick={() => handleBarcode(product?._id)}
                  >
                    <BsQrCode />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="totalprice">
          <span>
            Umumiy foyda: <b>{totalProfit.toLocaleString()}</b> so'm
          </span>
        </div>
      </div>

      {/* Add Product Modal */}
      <div className={`modal ${isOpen ? "active" : ""}`}>
        <div className="modal-content" ref={addAdminModalRef}>
          <div className="modal-header">
            <h1>
              {editingItem ? "Mahsulotni o'zgartirish" : "Mahsulot qo'shish"}
            </h1>
            <button className="close" onClick={toggleModal}>
              <IoClose />
            </button>
          </div>
          <div className="modal-body">
            <form className="form" onSubmit={onSubmit}>
              <label>
                <span>Barcode</span>
                <input
                  required
                  type="text"
                  autoComplete="off"
                  ref={brCodeRef}
                  defaultValue={editingItem ? editingItem.brCode : barcode}
                  readOnly={editingItem ? true : false}
                />
              </label>
              <label>
                <span>Maxsulot nomi</span>
                <input
                  ref={nameRef}
                  defaultValue={editingItem ? editingItem.name : ""}
                  required
                  type="text"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Kelgan narxi</span>
                <input
                  ref={purchasePriceRef}
                  defaultValue={editingItem ? editingItem.purchasePrice : ""}
                  required
                  type="number"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Minimal narxi</span>
                <input
                  ref={middlePriceRef}
                  defaultValue={editingItem ? editingItem.middlePrice : ""}
                  required
                  type="number"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Sotish narxi</span>
                <input
                  ref={sellingPriceRef}
                  defaultValue={editingItem ? editingItem.sellingPrice : ""}
                  required
                  type="number"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Kirim soni</span>
                <input
                  ref={quantityRef}
                  defaultValue={editingItem ? editingItem.quantity : ""}
                  required
                  type="number"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Kategoriya</span>
                <input
                  ref={categoryRef}
                  defaultValue={editingItem ? editingItem.category : ""}
                  required
                  type="text"
                  autoComplete="off"
                />
              </label>

              <div className="modal-footer">
                <button className="btn" type="submit">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <div className={`modal ${isEditModalOpen ? "active" : ""}`}>
        <div className="modal-content" ref={editAdminModalRef}>
          <div className="modal-header">
            <h1>Mahsulotni tahrirlash</h1>
            <button className="close" onClick={toggleEditModal}>
              <IoClose />
            </button>
          </div>
          <div className="modal-body">
            <form className="form" onSubmit={handleSubmit(onSubmit)}>
              <label>
                <span>Barcode</span>
                <input
                  {...register("brCode")}
                  required
                  type="text"
                  placeholder="Barcode"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Maxsulot nomi</span>
                <input
                  {...register("name")}
                  required
                  type="text"
                  placeholder="Maxsulot nomi"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Kelgan narxi</span>
                <input
                  {...register("purchasePrice")}
                  required
                  type="number"
                  placeholder="Kelgan narxi"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Sotish narxi</span>
                <input
                  {...register("sellingPrice")}
                  required
                  type="number"
                  placeholder="Sotish narxi"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Kirim soni</span>
                <input
                  {...register("quantity")}
                  required
                  type="number"
                  placeholder="Kirim soni"
                  autoComplete="off"
                />
              </label>
              <label>
                <span>Kategoriya</span>
                <input
                  {...register("category")}
                  required
                  type="text"
                  placeholder="Kategoriya"
                  autoComplete="off"
                />
              </label>

              <div className="modal-footer">
                <button className="btn" type="submit">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Barcode Modal */}
      <div className={`modal ${isBarcodeModalOpen ? "active" : ""}`}>
        <div className="modal-content2" ref={barcodeModalRef}>
          <div id="printable-barcode">
            <svg ref={barcodeRef} width={"100%"} />
          </div>

          <button className="btn" onClick={handlePrint}>
            Chop etish
          </button>
        </div>
      </div>
      <div></div>
    </Fragment>
  );
};
