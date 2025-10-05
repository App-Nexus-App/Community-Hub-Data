import { useState, useEffect } from 'react';
import ResourceCard from '../../Cards/ResourceCards/ResourceCard';
import SOSCard from '../../Cards/SOSCard/SOSCard';
import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../Data/firebase';
import { useLocation } from 'react-router-dom';
import './ResourcesPage.css';

const ResourcesPage = ({ resources, setResources, showSOS, setShowSOS }) => {
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [newResource, setNewResource] = useState({
    item: '',
    type: '',
    address: '',
    suburb: '',
    city: '',
    postalCode: '',
    date: '',
    quantity: '',
  });

  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || 'All');
  const [sosRequests, setSosRequests] = useState([]);

  const handleAddResource = async () => {
    const { item, type, address, suburb, city, postalCode, date, quantity } = newResource;
    const parsedQuantity = parseInt(quantity);

    if (item && type && address && city && parsedQuantity > 0) {
      const newEntry = {
        item,
        type,
        address,
        suburb,
        city,
        postalCode,
        status: 'Available',
        urgency: 'normal',
        date,
        quantity: parsedQuantity,
        location: `${address}, ${suburb}, ${city}, ${postalCode}`,
      };

      try {
        await addDoc(collection(db, 'resources'), newEntry);
        setResources([newEntry, ...resources]);
        setNewResource({
          item: '',
          type: '',
          address: '',
          suburb: '',
          city: '',
          postalCode: '',
          date: '',
          quantity: '',
        });
        setShowAddResourceForm(false);
      } catch (err) {
        console.error('Error adding resource to Firebase:', err);
      }
    }
  };

  useEffect(() => {
    const fetchResources = async () => {
      const querySnapshot = await getDocs(collection(db, 'resources'));
      const resourceList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(resourceList);
    };

    const fetchSOS = async () => {
      const querySnapshot = await getDocs(collection(db, 'sosRequests'));
      const sosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSosRequests(sosList);
    };

    fetchResources();
    fetchSOS();
  }, []);

  useEffect(() => {
    const unsubscribeResources = onSnapshot(collection(db, 'resources'), snapshot => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeSOS = onSnapshot(collection(db, 'sosRequests'), snapshot => {
      setSosRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeResources();
      unsubscribeSOS();
    };
  }, []);

  const filteredResources = resources.filter(resource => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Pads Emergency') {
      return resource.type === 'Pads' && resource.urgency === 'emergency';
    }
    return resource.type === selectedCategory;
  });

  const [sosForm, setSosForm] = useState({
    type: 'Pads Emergency',
    address: '',
    suburb: '',
    city: '',
    postalCode: '',
    description: '',
  });

  const handleSubmitSOS = () => {
    if (sosForm.address && sosForm.city && sosForm.description) {
      submitSOSInternal(sosForm);
      setSelectedCategory('Pads Emergency');
    }
  };

  const submitSOSInternal = async formData => {
    const newSOS = {
      ...formData,
      location: `${formData.address}, ${formData.suburb}, ${formData.city}, ${formData.postalCode}`,
      status: 'active',
      time: new Date().toLocaleString(),
    };

    try {
      await addDoc(collection(db, 'sosRequests'), newSOS);
      setSosRequests([newSOS, ...sosRequests]);
      setSosForm({
        type: 'Pads Emergency',
        address: '',
        suburb: '',
        city: '',
        postalCode: '',
        description: '',
      });
      setShowSOS(false);
    } catch (err) {
      console.error('Error sending SOS to Firebase:', err);
    }
  };

  return (
    <div className="resources-page">
      <div className="header-row">
        <h1 className="page-title">Ubuntu Resources</h1>
        <div>
          <button onClick={() => setShowAddResourceForm(true)} className="add-button">
            ➕ Add Resource
          </button>
          <button onClick={() => setShowSOS(true)} className="sos-button">
            🆘 SOS Request
          </button>
        </div>
      </div>

      {/* ➕ Add Resource Form */}
      {showAddResourceForm && (
        <div className="add-resource-form-container">
          <h3 className="add-resource-form-title">➕ Add New Resource</h3>
          <div className="add-resource-form">
            <input
              type="text"
              placeholder="Item Name"
              value={newResource.item}
              onChange={e => setNewResource({ ...newResource, item: e.target.value })}
              className="input-text"
            />
            <select
              value={newResource.type}
              onChange={e => setNewResource({ ...newResource, type: e.target.value })}
              className="input-select"
            >
              <option value="">Select Type</option>
              <option value="Food">Food</option>
              <option value="Clothing">Clothing</option>
              <option value="Pads">Pads</option>
            </select>

            {/* Address fields */}
            <input
              type="text"
              placeholder="Address Line"
              value={newResource.address}
              onChange={e => setNewResource({ ...newResource, address: e.target.value })}
              className="input-text"
            />
            <input
              type="text"
              placeholder="Suburb"
              value={newResource.suburb}
              onChange={e => setNewResource({ ...newResource, suburb: e.target.value })}
              className="input-text"
            />
            <input
              type="text"
              placeholder="City"
              value={newResource.city}
              onChange={e => setNewResource({ ...newResource, city: e.target.value })}
              className="input-text"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={newResource.postalCode}
              onChange={e => setNewResource({ ...newResource, postalCode: e.target.value })}
              className="input-text"
            />

            <input
              type="date"
              value={newResource.date}
              onChange={e => setNewResource({ ...newResource, date: e.target.value })}
              className="input-text"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newResource.quantity}
              onChange={e => setNewResource({ ...newResource, quantity: e.target.value })}
              className="input-text"
            />

            <div className="sos-form-buttons">
              <button onClick={handleAddResource} className="sos-send-button">
                Add Resource
              </button>
              <button onClick={() => setShowAddResourceForm(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆘 SOS Form */}
      {showSOS && (
        <div className="sos-form-container">
          <h3 className="sos-form-title">🆘 Emergency SOS Request</h3>
          <div className="sos-form">
            <select
              value={sosForm.type}
              onChange={e => setSosForm({ ...sosForm, type: e.target.value })}
              className="input-select"
            >
              <option>Pads Emergency</option>
              <option>Food Emergency</option>
              <option>Clothes Emergency</option>
            </select>

            {/* Address fields */}
            <input
              type="text"
              placeholder="Address Line"
              value={sosForm.address}
              onChange={e => setSosForm({ ...sosForm, address: e.target.value })}
              className="input-text"
            />
            <input
              type="text"
              placeholder="Suburb"
              value={sosForm.suburb}
              onChange={e => setSosForm({ ...sosForm, suburb: e.target.value })}
              className="input-text"
            />
            <input
              type="text"
              placeholder="City"
              value={sosForm.city}
              onChange={e => setSosForm({ ...sosForm, city: e.target.value })}
              className="input-text"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={sosForm.postalCode}
              onChange={e => setSosForm({ ...sosForm, postalCode: e.target.value })}
              className="input-text"
            />

            <textarea
              placeholder="Brief description of urgent need..."
              value={sosForm.description}
              onChange={e => setSosForm({ ...sosForm, description: e.target.value })}
              className="input-textarea"
            />
            <div className="sos-form-buttons">
              <button onClick={handleSubmitSOS} className="sos-send-button">
                🆘 Send SOS Alert
              </button>
              <button onClick={() => setShowSOS(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="category-filters">
        {['All', 'Food', 'Clothing', 'Pads'].map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
        <button
          className={`category-button ${selectedCategory === 'Pads Emergency' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('Pads Emergency')}
        >
          🆘 Pads SOS
        </button>
      </div>

      {/* Resource List */}
      <div className="resources-list">
        {filteredResources.length === 0 && <p>No resources found.</p>}
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {/* SOS List */}
      {selectedCategory === 'Pads Emergency' && (
        <div className="sos-cards-container">
          {sosRequests.map(sos => (
            <SOSCard key={sos.id} sos={sos} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
