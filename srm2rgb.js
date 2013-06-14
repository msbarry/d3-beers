// SRM to RGB conversion from http://methodbrewery.com/srm.php
(function(window) {
  var SRM_TO_RGB = [];
  SRM_TO_RGB[0] = 'rgb(250, 250, 210)';
  SRM_TO_RGB[1] = 'rgb(250, 250, 160)';
  SRM_TO_RGB[2] = 'rgb(250, 250, 105)';
  SRM_TO_RGB[3] = 'rgb(245, 246, 50)';
  SRM_TO_RGB[4] = 'rgb(235, 228, 47)';
  SRM_TO_RGB[5] = 'rgb(225, 208, 50)';
  SRM_TO_RGB[6] = 'rgb(215, 188, 52)';
  SRM_TO_RGB[7] = 'rgb(205, 168, 55)';
  SRM_TO_RGB[8] = 'rgb(198, 148, 56)';
  SRM_TO_RGB[9] = 'rgb(193, 136, 56)';
  SRM_TO_RGB[10] = 'rgb(192, 129, 56)';
  SRM_TO_RGB[11] = 'rgb(192, 121, 56)';
  SRM_TO_RGB[12] = 'rgb(192, 114, 56)';
  SRM_TO_RGB[13] = 'rgb(190, 106, 56)';
  SRM_TO_RGB[14] = 'rgb(180, 99, 56)';
  SRM_TO_RGB[15] = 'rgb(167, 91, 54)';
  SRM_TO_RGB[16] = 'rgb(152, 84, 51)';
  SRM_TO_RGB[17] = 'rgb(138, 75, 48)';
  SRM_TO_RGB[18] = 'rgb(124, 68, 41)';
  SRM_TO_RGB[19] = 'rgb(109, 60, 34)';
  SRM_TO_RGB[20] = 'rgb(95, 53, 23)';
  SRM_TO_RGB[21] = 'rgb(81, 45, 11)';
  SRM_TO_RGB[22] = 'rgb(67, 38, 12)';
  SRM_TO_RGB[23] = 'rgb(52, 30, 17)';
  SRM_TO_RGB[24] = 'rgb(38, 23, 22)';
  SRM_TO_RGB[25] = 'rgb(33, 19, 18)';
  SRM_TO_RGB[26] = 'rgb(28, 16, 15)';
  SRM_TO_RGB[27] = 'rgb(23, 13, 12)';
  SRM_TO_RGB[28] = 'rgb(18, 9, 8)';
  SRM_TO_RGB[29] = 'rgb(13, 6, 5)';
  SRM_TO_RGB[30] = 'rgb(8, 3, 2)';

  window.srm2rgb = function (srm) {
    var rounded = Math.abs(Math.round(srm));
    return SRM_TO_RGB[rounded] || 'rgb(8, 3, 2)';
  };
}(this));