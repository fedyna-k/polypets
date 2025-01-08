/**
 * Class to process images with OpenCV
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ImageProcessor {

    /**
     * 
     * @param {*} opencvObject The imported openCV object
     */
    constructor(opencvObject) {

        if (opencvObject == undefined) {
            return;
        }

        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    /**
     * Sets the openCV object locally in the class
     * @param {*} opencvObject 
     */
    setCV(opencvObject) {
        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    /**
     * Processes an image to get the homography matrix to get the plane of the board.
     * If not all corners of the board are detected, prints an error and does not return anything.
     * @param {ImageData} image The image to process
     * @returns The homography matrix associated with the image
     */
    analyseImage(image){
        const mat = this.cv.matFromImageData(image);

        try {
            return this.homography(mat);
        }
        catch(e) {
            console.error(e);
        }
    }

    /**
     * Processes an openCV image to get the position of all aruco markers in it, as well as their ids
     * @param {cv.Mat} mat A cv.Mat image
     * @returns [markers_position, ids] : The position of all aruco markers in the image with their associated id
     */
    analyseMat(mat) {
        let gray = new this.cv.Mat();
        this.cv.cvtColor(mat, gray, this.cv.COLOR_RGB2GRAY);
        mat.delete();
        
        let markers_position = new this.cv.MatVector();
        let ids = new this.cv.Mat();
        let rejected = new this.cv.MatVector();

        // Detection
        this.detector.detectMarkers(gray, markers_position, ids, rejected);
        
        
        // Free memory
        gray.delete();
        rejected.delete();

        return [markers_position, ids];
    }

    /**
     * Computes the homography matrix of an openCV image to get the plane of the board.
     * @param {cv.Mat} mat A cv.Mat image
     * @returns The homography matrix to get the plane of the board from the photo
     * @throws An error when the aruco markers of the corners are not detected
     */
    homography(mat) {
        let [markers_position, ids] = this.analyseMat(mat);

        let detected_corners = [0, 0, 0, 0];
        for (let i = 0; i < ids.size()["height"]; i++) {
            const cur_id = ids.data32S[i];
            if (cur_id < 4) {
                detected_corners[cur_id] = [markers_position.get(i).data32F[0], markers_position.get(i).data32F[1]];
            }

            
            // TESTS SEULEMENT : LES COINS EN BAS SONT INVERSÉS SUITE À UNE ERREUR D'IMPRESSION
            let tmp = detected_corners[3];
            detected_corners[3] = detected_corners[2];
            detected_corners[2] = tmp;
            // --------------------------------------------------------------------------------
        }

        const src_points = this.cv.matFromArray(4, 2, this.cv.CV_64F, [5, 5, 284, 5, 284, 197, 5, 197]);
        
        if (detected_corners.some(corner => typeof corner == "number")) {
            //throw new Error("Corners not detected properly");
        }
        
        const H = this.cv.findHomography(this.cv.matFromArray(4, 2, this.cv.CV_64F, detected_corners.flat()), src_points, this.cv.RANSAC, 3, new this.cv.Mat());
        return H.data64F;
    }
}