const createTooltip = (address) => {
  const tempArr = address.split(',');
  return `<div id="content">
      <div id="siteNotice">
      ${tempArr[0]}
      <br/>
      ${tempArr[1]}
      </div>
    </div>`;
};

const creators = {
  createTooltip,
};

export {
  creators as default,
  createTooltip,
}
