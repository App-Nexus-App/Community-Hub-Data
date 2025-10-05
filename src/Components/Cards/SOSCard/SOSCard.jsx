import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import './SOSCard.css';
import { useNavigate } from 'react-router-dom';

const SOSCard = ({ sos }) => {
  const navigate = useNavigate();

  const handleRespond = () => {
    navigate('/profile', {
      state: {
        message: `Responding to SOS: ${sos.type}\nLocation: ${
          typeof sos.location === 'object'
            ? `${sos.location.addressLine1}, ${sos.location.suburb}, ${sos.location.city}, ${sos.location.postalCode}`
            : sos.location
        }\nTime: ${sos.time}`,
      },
    });
  };

  // 🔹 Format and handle both string/object location
  let formattedLocation = '';
  if (typeof sos.location === 'object' && sos.location !== null) {
    const { addressLine1, suburb, city, postalCode } = sos.location;
    formattedLocation = `${addressLine1 || ''}${suburb ? `, ${suburb}` : ''}${city ? `, ${city}` : ''}${postalCode ? `, ${postalCode}` : ''}`;
  } else {
    formattedLocation = sos.location || 'No location provided';
  }

  return (
    <div className="sos-card">
      <div className="sos-card-header">
        <div className="sos-card-type">
          <AlertTriangle className="sos-icon" />
          <span className="sos-type-text">{sos.type}</span>
        </div>
        <span className={`sos-status ${sos.status === 'active' ? 'active' : 'resolved'}`}>
          {sos.status}
        </span>
      </div>

      {/* 🔹 Multi-line address display */}
      <div className="sos-location">
        <MapPin className="location-icon" />
        <div className="location-text">
          {typeof sos.location === 'object' ? (
            <>
              <div>{sos.location.addressLine1}</div>
              {sos.location.suburb && <div>{sos.location.suburb}</div>}
              {sos.location.city && <div>{sos.location.city}</div>}
              {sos.location.postalCode && <div>{sos.location.postalCode}</div>}
            </>
          ) : (
            <span>{formattedLocation}</span>
          )}
        </div>
      </div>

      <div className="sos-time">
        <Clock className="clock-icon" />
        <span>{sos.time}</span>
      </div>

      <button className="btn-respond" onClick={handleRespond}>
        Respond Now
      </button>
    </div>
  );
};

export default SOSCard;
