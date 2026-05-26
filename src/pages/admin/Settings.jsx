import React, { useEffect, useState, useContext } from "react";
import { API_URL } from "../../config";
import { LogoContext } from "../../context/LogoContext";
import LogoUpload from "../../components/LogoUpload";

export default function Settings() {
  const { setSelectedLogo } = useContext(LogoContext);

  const [logos, setLogos] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    loadLogos();
  }, []);

  // FETCH LOGOS
  const loadLogos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/logo/all`);
      const data = await res.json();

      setLogos(data);

      const activeLogo = data.find((l) => l.status === "active");
      if (activeLogo) {
        setSelected(String(activeLogo.id));
        setSelectedLogo(String(activeLogo.id));
      }
    } catch (err) {
      console.error("Error loading logos:", err);
    }
  };

  // SAVE ACTIVE LOGO
  const saveActiveLogo = async () => {
    if (!selected) {
      alert("Please select a logo first.");
      return;
    }

    try {
      await fetch(`${API_URL}/api/logo/set-active/${selected}`, {
        method: "PUT",
      });

      setSelectedLogo(String(selected));
      loadLogos();
      alert("Logo updated successfully!");
    } catch (error) {
      console.error("Error updating logo:", error);
      alert("Failed to update logo");
    }
  };

  // DELETE LOGO FUNCTION
  const deleteLogo = async (id, status) => {
    if (status === "active") {
      alert("You cannot delete the active logo. Please activate another logo first.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this logo?")) return;

    try {
      await fetch(`${API_URL}/api/logo/delete/${id}`, {
        method: "DELETE",
      });

      alert("Logo deleted successfully!");
      loadLogos(); // refresh list
    } catch (err) {
      console.error("Error deleting logo:", err);
      alert("Failed to delete logo");
    }
  };

  return (
    <div className="mainpro">
      <div className="container"> 

        <div className="card shadow-sm border-0 p-3"> 
             <LogoUpload onUploadSuccess={loadLogos} />
        </div>
        <div className="card shadow-sm border-0 p-3">
          <div className="row"> 
            <div className="logolist">
              <h5>Select Website Logo</h5> 
              <ul>
                {logos.map((logo) => (
                  <li key={logo.id}>
                    <label>
                      <div className="userinfo">
                        <img
                          src={`${API_URL}/api/logo/image/${logo.id}`}
                          alt=""
                        />
                      </div>

                      <input
                        type="radio"
                        name="activeLogo"
                        className="form-check-input"
                        checked={String(selected) === String(logo.id)}
                        onChange={() => setSelected(String(logo.id))}
                      />

                      <span>Use this logo</span>
                    </label>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => deleteLogo(logo.id, logo.status)}
                      className="deletebtn"
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button type="button" onClick={saveActiveLogo} className="btn btn-primary mt-3">
            Save Logo
          </button>
        </div>
      </div>
    </div>
  );
}
