// components/PlanCard.jsx
import PropTypes from 'prop-types';

const PlanCard = ({ plan, onSubscribe }) => (
  <div className="border p-6 rounded-lg shadow-lg w-64 text-center">
    <h2 className="text-2xl font-bold">{plan.name}</h2>
    <p className="mt-4 text-xl">
      {plan.price === 0 ? 'Free' : `$${plan.price} / month`}
    </p>
    <button
      onClick={() => onSubscribe(plan.id)}
      className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      {plan.price === 0 ? 'Start Free' : 'Subscribe'}
    </button>
  </div>
);

PlanCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  onSubscribe: PropTypes.func.isRequired,
};

export default PlanCard;
