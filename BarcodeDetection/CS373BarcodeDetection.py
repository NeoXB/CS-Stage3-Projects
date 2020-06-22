import sys

from matplotlib import pyplot
from matplotlib.patches import Rectangle

# this is our module that performs the reading of a png image
# it is part of the skeleton code
import imageIO.png


# this function reads an RGB color png file and returns width, height, as well as pixel arrays for r,g,b
def readRGBImageToSeparatePixelArrays(input_filename):

    image_reader = imageIO.png.Reader(filename=input_filename)
    # png reader gives us width and height, as well as RGB data in image_rows (a list of rows of RGB triplets)
    (image_width, image_height, rgb_image_rows, rgb_image_info) = image_reader.read()

    print("read image width={}, height={}".format(image_width, image_height))

    # our pixel arrays are lists of lists, where each inner list stores one row of greyscale pixels
    pixel_array_r = []
    pixel_array_g = []
    pixel_array_b = []

    for row in rgb_image_rows:
        pixel_row_r = []
        pixel_row_g = []
        pixel_row_b = []
        r = 0
        g = 0
        b = 0
        for elem in range(len(row)):
            # RGB triplets are stored consecutively in image_rows
            if elem % 3 == 0:
                r = row[elem]
            elif elem % 3 == 1:
                g = row[elem]
            else:
                b = row[elem]
                pixel_row_r.append(r)
                pixel_row_g.append(g)
                pixel_row_b.append(b)

        pixel_array_r.append(pixel_row_r)
        pixel_array_g.append(pixel_row_g)
        pixel_array_b.append(pixel_row_b)

    return (image_width, image_height, pixel_array_r, pixel_array_g, pixel_array_b)


# This method takes a greyscale pixel array and writes it into a png file
def writeGreyscalePixelArraytoPNG(output_filename, pixel_array, image_width, image_height):
    # now write the pixel array as a greyscale png
    file = open(output_filename, 'wb')  # binary mode is important
    writer = imageIO.png.Writer(image_width, image_height, greyscale=True)
    writer.write(file, pixel_array)
    file.close()


# Creates a two dimensional array representing an image as a very simple (not very efficient) list of lists
# datastructure.
# The outer list is covering all the image rows. Each row is an inner list covering the columns of the image.
def createInitializedGreyscalePixelArray(image_width, image_height, initValue = 0):
    new_array = []
    for row in range(image_height):
        new_row = []
        for col in range(image_width):
            new_row.append(initValue)
        new_array.append(new_row)

    return new_array


# Takes as input a greyscale pixel array and computes the minimum and maximum greyvalue.
# Returns minimum and maximum greyvalue as a tuple
def computeMinAndMaxValues(pixel_array, image_width, image_height):
    min_value = sys.maxsize
    max_value = -min_value

    for y in range(image_height):
        for x in range(image_width):
            if pixel_array[y][x] < min_value:
                min_value = pixel_array[y][x]
            if pixel_array[y][x] > max_value:
                max_value = pixel_array[y][x]

    return(min_value, max_value)


# This function analyzes the return value of the connected component label algorithm to derive the 
# bounding box around the largest connected component. Thus, it prepares the result to be shown 
# using a rectangle around the detected barcode.
def determineLargestConnectedComponent(cclabeled, label_size_dictionary, image_width, image_height):

    final_labeled = createInitializedGreyscalePixelArray(image_width, image_height)

    size_of_largest_component = 0
    label_of_largest_component = 0
    for lbl_i in label_size_dictionary.keys():
        if label_size_dictionary[lbl_i] > size_of_largest_component:
            size_of_largest_component = label_size_dictionary[lbl_i]
            label_of_largest_component = lbl_i

    print("label of largest component: ", label_of_largest_component)

    # determine bounding box of the largest component only
    bbox_min_x = image_width
    bbox_min_y = image_height
    bbox_max_x = 0
    bbox_max_y = 0
    for y in range(image_height):
        for x in range(image_width):
            if cclabeled[y][x] == label_of_largest_component:
                final_labeled[y][x] = 255
                if x < bbox_min_x:
                    bbox_min_x = x
                if y < bbox_min_y:
                    bbox_min_y = y
                if x > bbox_max_x:
                    bbox_max_x = x
                if y > bbox_max_y:
                    bbox_max_y = y
            else:
                final_labeled[y][x] = 0

    return (final_labeled, (bbox_min_x, bbox_max_x, bbox_min_y, bbox_max_y))


# a simple Queue datastructure based on a list, not very efficient but sufficient
# for a simple connected component labeling implementation
class Queue:
    def __init__(self):
        self.items = []

    def isEmpty(self):
        return self.items == []

    def enqueue(self, item):
        self.items.insert(0,item)

    def dequeue(self):
        return self.items.pop()

    def size(self):
        return len(self.items)
        




# TO BE IMPLEMENTED by students (see coderunner)

# Week 1

def computeRGBToGreyscale(pixel_array_r, pixel_array_g, pixel_array_b, image_width, image_height):
    gpa = []
    for i in range(image_height):
        array = []
        for j in range(image_width):
            g = 0.299*pixel_array_r[i][j]+0.587*pixel_array_g[i][j]+0.114*pixel_array_b[i][j]
            array.append(int(round(g)))
        gpa.append(array)
    return gpa


def scaleTo0And255AndQuantize(pixel_array, image_width, image_height):
    t = ()
    t = computeMinAndMaxValues(pixel_array, image_width, image_height)
    flow = t[0]
    fhigh = t[1]
    cspa = []
    for i in range(image_height):
        array = []
        for j in range(image_width):
            f = fhigh - flow
            if f != 0:
                sout = (pixel_array[i][j] - flow)*(255/(fhigh-flow))
                new_sout = int(round(sout))
                if new_sout < 0:
                    array.append(0)
                elif new_sout > 255:
                    array.append(255)
                else:
                    array.append(new_sout)
            else:
                array.append(0)
        cspa.append(array)
    return cspa


# Week 2

# computes vertical edges using Sobel filter (see lecture slides)
# we ignore border pixels
def computeVerticalEdgesSobelAbsolute(pixel_array, image_width, image_height):
    vert_edges = []
    for i in range(image_height):
        array = []
        if i == 0 or i == image_height - 1:
            for j in range(image_width):
                array.append(float(0))
        else:
            for j in range(image_width):
                if j == 0 or j == image_width - 1:
                    array.append(float(0))
                else:
                    total = (pixel_array[i-1][j-1]*-1 + pixel_array[i-1][j]*0 + pixel_array[i-1][j+1]
                            +pixel_array[i][j-1]*-2 + pixel_array[i][j]*0 + pixel_array[i][j+1]*2
                            +pixel_array[i+1][j-1]*-1 + pixel_array[i+1][j]*0 + pixel_array[i+1][j+1])
                    mean = total / 8
                    array.append(abs(mean))
        vert_edges.append(array)
    return vert_edges

# computes horizontal edges using Sobel filter (see lecture slides)
# we ignore border pixels
def computeHorizontalEdgesSobelAbsolute(pixel_array, image_width, image_height):
    horz_edges = []
    for i in range(image_height):
        array = []
        if i == 0 or i == image_height - 1:
            for j in range(image_width):
                array.append(float(0))
        else:
            for j in range(image_width):
                if j == 0 or j == image_width - 1:
                    array.append(float(0))
                else:
                    total = (pixel_array[i-1][j-1]*-1 + pixel_array[i-1][j]*-2 + pixel_array[i-1][j+1]*-1
                            +pixel_array[i][j-1]*0 + pixel_array[i][j]*0 + pixel_array[i][j+1]*0
                            +pixel_array[i+1][j-1] + pixel_array[i+1][j]*2 + pixel_array[i+1][j+1])
                    mean = total / 8
                    array.append(abs(mean))
        horz_edges.append(array)
    return horz_edges


# takes vertical and horizontal edges as input and subtracts horizontal from vertical edges
# additionally, if this subtraction is negative, the value is set to 0
# assumes that vertical and horizontal edges are normalized!
# returns the subtracted image
def computeStrongVerticalEdgesBySubtractingHorizontal(vertical_edges, horizontal_edges, image_width, image_height):

    new_edges = []
    for i in range(image_height):
        array = []
        for j in range(image_width):
            v = vertical_edges[i][j] - horizontal_edges[i][j]
            if v < 0:
                array.append(0)
            else:
                array.append(v)
        new_edges.append(array)
    return new_edges

def computeBoxAveraging3x3(pixel_array, image_width, image_height):

    smoothed_image = []
    for i in range(image_height):
        array = []
        if i == 0 or i == image_height - 1:
            for j in range(image_width):
                array.append(float(0))
        else:
            for j in range(image_width):
                if j == 0 or j == image_width - 1:
                    array.append(float(0))
                else:
                    total = (pixel_array[i-1][j-1] + pixel_array[i-1][j] + pixel_array[i-1][j+1]
                            +pixel_array[i][j-1] + pixel_array[i][j] + pixel_array[i][j+1]
                            +pixel_array[i+1][j-1] + pixel_array[i+1][j] + pixel_array[i+1][j+1])
                    mean = total / 9
                    array.append(mean)
        smoothed_image.append(array)
    return smoothed_image

# returns 255 for pixels greater or equal (GE) threshold value, 0 otherwise (strictly lower)
def computeThresholdGE(pixel_array, threshold_value, image_width, image_height):

    thresholded = []
    for i in range(image_height):
        array = []
        for j in range(image_width):
            if pixel_array[i][j] < threshold_value:
                array.append(0)
            else:
                array.append(255)
        thresholded.append(array)
    return thresholded


# Week 3

def computeErosion8Nbh3x3FlatSE(pixel_array, image_width, image_height):

    eroded = []
    for i in range(image_height):
        array = []
        if i == 0 or i == image_height-1:
            for j in range(image_width):
                array.append(0)
        else:
            for j in range(image_width):
                if j == 0 or j == image_width-1:
                    array.append(0)
                else:
                    if ((pixel_array[i-1][j-1] == 1 and pixel_array[i-1][j] == 1 and pixel_array[i-1][j+1] == 1and
                        pixel_array[i][j-1] == 1 and pixel_array[i][j+1] == 1 and
                        pixel_array[i+1][j-1] == 1 and pixel_array[i+1][j] == 1 and pixel_array[i+1][j+1] == 1)
                        or
                        (pixel_array[i-1][j-1] == 255 and pixel_array[i-1][j] == 255 and pixel_array[i-1][j+1] == 255 and
                        pixel_array[i][j-1] == 255 and pixel_array[i][j+1] == 255 and
                        pixel_array[i+1][j-1] == 255 and pixel_array[i+1][j] == 255 and pixel_array[i+1][j+1] == 255)):
                            array.append(1)
                    else:
                        array.append(0)
        eroded.append(array)
    return eroded


def computeDilation8Nbh3x3FlatSE(pixel_array, image_width, image_height):
    
    for i in range(image_height):
        pixel_array[i].insert(0,0)
        pixel_array[i].append(0)
    temp = []
    for i in range(image_width+2):
        temp.append(0)
    pixel_array.insert(0,temp)
    pixel_array.append(temp)
    
    dilated = []
    for i in range(1, image_height+1):
        array = []
        for j in range(1, image_width+1):
            if ((pixel_array[i-1][j-1] == 1 or pixel_array[i-1][j] == 1 or pixel_array[i-1][j+1] == 1 or
                pixel_array[i][j-1] == 1 or pixel_array[i][j+1] == 1 or
                pixel_array[i+1][j-1] == 1 or pixel_array[i+1][j] == 1 or pixel_array[i+1][j+1] == 1)
                or
                (pixel_array[i-1][j-1] == 255 or pixel_array[i-1][j] == 255 or pixel_array[i-1][j+1] == 255 or
                pixel_array[i][j-1] == 255 or pixel_array[i][j+1] == 255 or
                pixel_array[i+1][j-1] == 255 or pixel_array[i+1][j] == 255 or pixel_array[i+1][j+1] == 255)):
                    array.append(1)
            else:
                array.append(0)
        dilated.append(array)
    return dilated


def computeConnectedComponentLabeling(binary_array, image_width, image_height):

    for i in range(image_height):
        binary_array[i].insert(0,0)
        binary_array[i].append(0)
    temp = [0] * (image_width+2)
    binary_array.insert(0,temp)
    binary_array.append(temp)
    
    mega_list = set()
    region_dict = {}
    regno = 0
    q = Queue()
    for i in range(1, image_height+1):
        for j in range(1, image_width+1):
            if binary_array[i][j] > 0 and (i,j) not in mega_list:
                mega_list.add((i,j))
                q.enqueue((i,j))
                regno += 1
                region_dict[regno] = [(i,j)]
                while not q.isEmpty():
                    coord = q.dequeue()
                    if (binary_array[coord[0]-1][coord[1]] > 0 and 
                        (coord[0]-1,coord[1]) not in mega_list):
                            mega_list.add((coord[0]-1,coord[1]))
                            q.enqueue((coord[0]-1,coord[1]))
                            region_dict[regno].append((coord[0]-1,coord[1]))
                    if (binary_array[coord[0]+1][coord[1]] > 0 and 
                        (coord[0]+1,coord[1]) not in mega_list):
                            mega_list.add((coord[0]+1,coord[1]))
                            q.enqueue((coord[0]+1,coord[1]))
                            region_dict[regno].append((coord[0]+1,coord[1]))
                    if (binary_array[coord[0]][coord[1]-1] > 0 and 
                        (coord[0],coord[1]-1) not in mega_list):
                            mega_list.add((coord[0],coord[1]-1))
                            q.enqueue((coord[0],coord[1]-1))
                            region_dict[regno].append((coord[0],coord[1]-1))
                    if (binary_array[coord[0]][coord[1]+1] > 0 and 
                        (coord[0],coord[1]+1) not in mega_list):
                            mega_list.add((coord[0],coord[1]+1))
                            q.enqueue((coord[0],coord[1]+1))
                            region_dict[regno].append((coord[0],coord[1]+1))
    for key in region_dict:
        for tup in region_dict[key]:
            binary_array[tup[0]][tup[1]] = key
    binary_array.pop(0)
    binary_array.pop()
    for i in range(image_height):
        binary_array[i].pop(0)
        binary_array[i].pop()
    
    reg_count = {}
    for key in region_dict:
        reg_count[key] = len(region_dict[key])
    
    return (binary_array,reg_count)





# This is our code skeleton that performs the barcode detection.
# The code works on images of items where the barcode is shown in a horizontal way.
# Feel free to try it on your own images of objects, but make sure that the input image size and barcode size
# is not too different from our examples.
def main():

    filename = "./images/barcodeDetection/barcode_09.png"

    # we read in the png file, and receive three pixel arrays for red, green and blue components, respectively
    # each pixel array contains 8 bit integer values between 0 and 255 encoding the color values
    (image_width, image_height, px_array_r, px_array_g, px_array_b) = readRGBImageToSeparatePixelArrays(filename)

    # first we have to convert the red, green and blue pixel arrays to a greyscale representation.
    # This is done using the formula: greyvalue = 0.299 * red + 0.587 * green + 0.114 * blue
    # TODO: implement this conversion function
    px_array = computeRGBToGreyscale(px_array_r, px_array_g, px_array_b, image_width, image_height)

    # next we make sure that the input greyscale image is scaled across the full 8 bit range (0 and 255)
    # TODO: implement this contrast stretching function
    px_array = scaleTo0And255AndQuantize(px_array, image_width, image_height)


    # setup the plots for intermediate results in a figure
    fig1, axs1 = pyplot.subplots(3, 2)
    axs1[0, 0].set_title('Input greyscale image')
    axs1[0, 0].imshow(px_array, cmap='gray')

    # now we compute the horizontal edges in the image and take its absolute values...
    # TODO: implement this edge enhancement function
    horizontal_edges = computeHorizontalEdgesSobelAbsolute(px_array, image_width, image_height)
    # scale horizontal edges to the range 0 and 255
    horizontal_edges = scaleTo0And255AndQuantize(horizontal_edges, image_width, image_height)

    # as well as the vertical edges in the image, again taking its absolute values.
    # TODO: implement this edge enhancement function
    vertical_edges = computeVerticalEdgesSobelAbsolute(px_array, image_width, image_height)
    # scale vertical edges to the range 0 and 255
    vertical_edges = scaleTo0And255AndQuantize(vertical_edges, image_width, image_height)

    # now we want to enhance strong vertical edges (our barcodes) by subtracting all horizontal edges
    # TODO: implement this edge processing function
    edges = computeStrongVerticalEdgesBySubtractingHorizontal(vertical_edges, horizontal_edges, image_width, image_height)
    edges = scaleTo0And255AndQuantize(edges, image_width, image_height)

    # next we blur our edge image using a 3x3 mean filter (averaging or box filter) a total of four times
    # the result of the 3x3 mean filter ignores the border pixels, therefore the output is 0 along the image border
    averaged_edges = edges
    for i in range(10):
        # TODO: implement this filtering function
        averaged_edges = computeBoxAveraging3x3(averaged_edges, image_width, image_height)
    averaged_edges = scaleTo0And255AndQuantize(averaged_edges, image_width, image_height)

    axs1[0, 1].set_title('Averaged edge image')
    axs1[0, 1].imshow(averaged_edges, cmap='gray')

    # we use a threshold value of 70 to binarize the edge image. Note that this threshold depends crucially
    # on the fact that we are always working with normalized 8 bit images between 0 and 255
    threshold_value = 70
    # TODO: implement this thresholding function
    thresholded = computeThresholdGE(averaged_edges, threshold_value, image_width, image_height)

    axs1[1, 0].set_title('Thresholded image')
    axs1[1, 0].imshow(thresholded, cmap='gray')

    eroded = thresholded
    for i in range(4):
        # TODO: implement this morphological operation
        eroded = computeErosion8Nbh3x3FlatSE(eroded, image_width, image_height)
    dilated = eroded
    for i in range(4):
        # TODO: implement this morphological operation
        dilated = computeDilation8Nbh3x3FlatSE(dilated, image_width, image_height)

    axs1[1, 1].set_title('Morphologically processed image')
    axs1[1, 1].imshow(dilated, cmap='gray')


    # taking the morphologically cleaned up binary image, we finally look for the largest connected component
    # in the image
    # TODO: implement connected component labeling
    (cclabeled, size_dict_cc) = computeConnectedComponentLabeling(dilated, image_width, image_height)


    # inspect the result of the connected component labeling, derive the largest component and its bounding box
    (final_labeled, (bbox_min_x, bbox_max_x, bbox_min_y, bbox_max_y)) = \
        determineLargestConnectedComponent(cclabeled, size_dict_cc, image_width, image_height)

    axs1[2, 0].set_title('Largest detected component')
    axs1[2, 0].imshow(final_labeled, cmap='gray')

    print("bbox {} {} {} {}".format(bbox_min_x, bbox_max_x, bbox_min_y, bbox_max_y))


    # Draw the bounding box as a rectangle into the original input image
    axs1[2, 1].set_title('Final image of detection')
    axs1[2, 1].imshow(px_array, cmap='gray')
    rect = Rectangle((bbox_min_x, bbox_min_y), bbox_max_x - bbox_min_x, bbox_max_y - bbox_min_y, linewidth=3,
                     edgecolor='g', facecolor='none')
    axs1[2, 1].add_patch(rect)

    # plot the current figure
    pyplot.show()

if __name__ == "__main__":
    main()



