
import "./App.css";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";

function App() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("nature");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isNavbarFixed, setIsNavbarFixed] = useState(false);

  const { ref, inView } = useInView();

  // Fetch images from Pexels API
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.pexels.com/v1/search`, {
        params: {
          query,
          page,
          per_page: 12,
        },
        headers: {
          Authorization:
            "u4iJCbm5Rasci0noi9O1pUSvrUVJFeu9q09L936B4OkJf8SvRcmTXI23", // Replace with your Pexels API key
        },
      });
      setImages((prevImages) => [...prevImages, ...response.data.photos]);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchImages();
  }, [page, query, fetchImages]);

  useEffect(() => {
    if (inView) setPage((prevPage) => prevPage + 1);
  }, [inView]);

  const handleSearch = (e) => {
    e.preventDefault();
    setImages([]);
    setPage(1);
    fetchImages();
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleModalClose = () => {
    setSelectedImage(null);
  };

  const handleFavorite = (image) => {
    setFavorites((prevFavorites) =>
      prevFavorites.find((fav) => fav.id === image.id)
        ? prevFavorites.filter((fav) => fav.id !== image.id)
        : [...prevFavorites, image]
    );
  };

  const handleDownload = async (url) => {
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "image.jpg"; // Change the filename as desired
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  // Scroll listener to toggle navbar class
  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarFixed(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav
        className={`navbar navbar-expand-lg navbar-light text-white bg-white ${
          isNavbarFixed ? "fixed-top" : ""
        }`}
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Pexels
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="categoriesDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categories
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="categoriesDropdown"
                >
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setQuery("nature")}
                    >
                      Nature
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setQuery("animals")}
                    >
                      Animals
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setQuery("technology")}
                    >
                      Technology
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item"
                      href="#"
                      onClick={() => setQuery("architecture")}
                    >
                      Architecture
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
            <form className="d-flex" onSubmit={handleSearch}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search images"
                aria-label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-outline-success" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Image Gallery */}
      <div className="container mt-5">
        <div className="row">
          {images.map((image, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card" onClick={() => handleImageClick(image)}>
                <img
                  src={image.src.medium}
                  className="card-img-top"
                  alt={image.alt || "Image"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="text-center">
        {loading && (
          <button className="btn btn-primary" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </button>
        )}
      </div>

      {/* Modal for Enlarged Image */}
      {selectedImage && (
        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedImage.alt || "Image"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={selectedImage.src.large}
                  alt={selectedImage.alt || "Image"}
                  className="img-fluid"
                />
              </div>
              <div className="modal-footer">
                <button
                  className={`btn ${
                    favorites.find((fav) => fav.id === selectedImage.id)
                      ? "btn-danger"
                      : "btn-outline-danger"
                  }`}
                  onClick={() => handleFavorite(selectedImage)}
                >
                  {favorites.find((fav) => fav.id === selectedImage.id)
                    ? "Unfavorite"
                    : "Favorite"}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleDownload(selectedImage.src.original)}
                >
                  Download
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;