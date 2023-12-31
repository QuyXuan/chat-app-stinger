export const constants = {
  EMAIL_REGEX:
    /^(?=.{15,50}$)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  PASSWORD_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
  URL_REGEX:
    /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
  DEFAULT_AVATAR_URL:
    'https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=6&m=1223671392&s=170667a&w=0&h=zP3l7WJinOFaGb2i1F4g8IS2ylw0FlIaa6x3tP9sebU=',
  DEFAULT_GROUP_AVATAR_URL:
    'https://th.bing.com/th/id/OIP.OtLqKEL4eIvyiNSJZ4pT-wHaHa?pid=ImgDet&rs=1',
  STATUS_ONLINE: 'online',
  PREVIOUS_NAV_LINK_ID: -1,
  MESSAGE_TAKE: 5,
};
