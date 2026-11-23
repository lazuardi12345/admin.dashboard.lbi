const BIPA_SERVICE_SLUG = 'program-bipa-129';

export function splitLegacyBipaContent(html) {
  if (typeof DOMParser === 'undefined') {
    return { introduction: '', details: html };
  }

  const parsed = new DOMParser().parseFromString(html || '', 'text/html');
  const nodes = Array.from(parsed.body.childNodes);
  let splitIndex = nodes.findIndex((node) => node.nodeType === Node.ELEMENT_NODE && /^H[2-4]$/.test(node.tagName));

  if (splitIndex < 0) {
    const paragraphIndexes = nodes.reduce((indexes, node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') indexes.push(index);
      return indexes;
    }, []);
    if (paragraphIndexes.length > 1) splitIndex = paragraphIndexes[1];
  }

  if (splitIndex < 0) return { introduction: '', details: html || '' };

  const toHtml = (node) => node.outerHTML || node.textContent;
  return {
    introduction: nodes.slice(0, splitIndex).map(toHtml).join(''),
    details: nodes.slice(splitIndex).map(toHtml).join('')
  };
}

export function prepareMarketingServiceForEditing(service) {
  if (
    service?.slug !== BIPA_SERVICE_SLUG ||
    (service.video_description !== null && service.video_description !== undefined)
  ) {
    return service;
  }

  const { introduction, details } = splitLegacyBipaContent(service.body);
  if (!introduction) return { ...service, video_description: '' };

  return { ...service, video_description: introduction, body: details };
}
