import PropTypes from 'prop-types';
import useConfig from 'hooks/useConfig';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

function srcset(image, width, height, rows = 1, cols = 1) {
  return `${image}?w=${width * cols}&h=${height * rows}&fit=crop&auto=format 1x, ${image}?w=${width * cols}&h=${height * rows}&fit=crop&auto=format&dpr=2 2x`;
}

export default function ImageList({ itemData = [] }) {
  const {
    state: { borderRadius }
  } = useConfig();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" style={{ borderRadius }}>
      {itemData.map((item) => {
        const featured = Boolean(item.featured);
        const image = getImageUrl(String(item.img), ImagePath.PROFILE);
        return (
          <figure
            key={item.img}
            className={`group relative overflow-hidden rounded-lg ${featured ? 'col-span-2 row-span-2' : ''}`}
            style={{ borderRadius, minHeight: featured ? 320 : 220 }}
          >
            <img
              src={srcset(image, 250, 200, featured ? 2 : 1, featured ? 2 : 1)}
              alt={item.title || ''}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-3 text-sm font-medium text-white">
              {item.title}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

ImageList.propTypes = { itemData: PropTypes.array };
