// VenueApplication.jsx
import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_DOMAIN } from "../../config";
import "./VenueApplication.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function VenueApplication() {
  const { user } = useAuth();
  const token = user?.accessToken;

  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [detail, setDetail] = useState("");
  const [images, setImages] = useState({ image1: null, image2: null });
  const [statusMessage, setStatusMessage] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // hidden file inputs
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);

  /** 處理檔案選擇 */
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setStatusMessage(`檔案 "${file.name}" 太大，請選擇小於 5MB 的圖片。`);
      e.target.value = "";
      return;
    }
    setStatusMessage("");
    setImages((prev) => ({ ...prev, [name]: file }));
  };

  /** 安全解析 JSON */
  const safeParseJson = async (res) => {
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : {};
  };

  /** 送出表單 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatusMessage("未登入，請先登入後再操作。");
      return;
    }
    setSubmitting(true);
    setStatusMessage("");
    setApplicationId(null);
    try {
      const fd = new FormData();
      fd.append("venueName", venueName);
      fd.append("address", address);
      fd.append("phone", phone);
      fd.append("detail", detail);
      images.image1 && fd.append("image1", images.image1);
      images.image2 && fd.append("image2", images.image2);

      const res = await fetch(`${API_DOMAIN}/maintainer_applications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await safeParseJson(res);
        throw new Error(err.message || `Error ${res.status}`);
      }
      const result = await safeParseJson(res);
      window.alert("申請成功！");
      window.location.href = "/";
      setStatusMessage("申請已送出，待管理員審核。");
      setApplicationId(result.id || null);
      // reset
      setVenueName("");
      setAddress("");
      setPhone("");
      setDetail("");
      setImages({ image1: null, image2: null });
    } catch (err) {
      console.error(err);
      setStatusMessage(`送出失敗：${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="venue-app-form">
      <h2>申請場地管理員</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* 文字欄位 */}
        <label>
          場地名稱
          <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} required />
        </label>
        <label>
          地址
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </label>
        <label>
          聯絡電話
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 02-1234-5678" />
        </label>
        <label>
          詳細說明
          <textarea value={detail} onChange={(e) => setDetail(e.target.value)} />
        </label>

        {/* 上傳按鈕 ── 同列 40% 寬 */}
        <div className="file-section">
          <div className="upload-row">
            {/* 圖片 1 */}
            <div className="upload-field">
              <input type="file" name="image1" accept="image/*" onChange={handleFileChange} ref={image1Ref} style={{ display: "none" }} required />
              <button type="button" className="upload-button" onClick={() => image1Ref.current?.click()}>
                選擇證明圖片 1
              </button>
              {images.image1 && <span className="filename">{images.image1.name}</span>}
            </div>
            {/* 圖片 2 */}
            <div className="upload-field">
              <input type="file" name="image2" accept="image/*" onChange={handleFileChange} ref={image2Ref} style={{ display: "none" }} required />
              <button type="button" className="upload-button" onClick={() => image2Ref.current?.click()}>
                選擇證明圖片 2
              </button>
              {images.image2 && <span className="filename">{images.image2.name}</span>}
            </div>
          </div>

          {/* 預覽區塊 ── 同列 40% 寬 */}
          <div className="preview-row">
            {images.image1 && <img src={URL.createObjectURL(images.image1)} alt="證明 1 預覽" className="preview-image" />}
            {images.image2 && <img src={URL.createObjectURL(images.image2)} alt="證明 2 預覽" className="preview-image" />}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="submit-button">
          {submitting ? "送出中…" : "送出申請"}
        </button>
      </form>

      {statusMessage && <p className="status">{statusMessage}</p>}
      {applicationId && <p className="application-id">申請編號：{applicationId}</p>}
    </div>
  );
}
