import PropTypes from 'prop-types';

export default function CardSecondaryAction({ title = 'Reference', link = '#', icon }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={title}
      title={title}
      className="inline-flex size-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      {icon || (
        <span aria-hidden="true" className="text-sm font-bold">
          ↗
        </span>
      )}
    </a>
  );
}

CardSecondaryAction.propTypes = { title: PropTypes.string, link: PropTypes.string, icon: PropTypes.node };
