require 'fileutils'
require 'colorize'
require 'erb'
require 'htmlcompressor'
require 'sassc'

module FooterDriver

  def FooterDriver.build_all
    FooterDriver.build_brand # Generic

    # Brands
    [
      'Ling Ling'
    ].each do |brand|
      FooterDriver.build_brand(brand: brand)
    end
  end

  def FooterDriver.build_brand(brand:nil)
    brand_name = brand || 'Generic'
    brand_folder =
      if brand.nil?
        'build'
      else
        FileUtils.mkdir_p(folder = File.join('build', brand.dash_case))
        folder
      end

    puts " Building: #{brand_name}".white.on_black

    [
      # Raw footer file.  Easy to include in other things on the server side.
      {
        input:  'templates/footer.html.erb',
        output: File.join(brand_folder,'footer.html')
      },
      # Minified raw footer file, for including into things in production.
      {
        input:  'templates/footer.html.erb',
        output: File.join(brand_folder,'footer.min.html'),
        minified: true
      },

      # footer file for JSONP.  For lazy-loading from the client side.
      {
        input:  'templates/footer.jsonp.erb',
        output: File.join(brand_folder,'footer.json')
      },
      # Minified JSONP footer file, for lazy loading in production.
      {
        input:  'templates/footer.jsonp.erb',
        output: File.join(brand_folder,'footer.min.json'),
        minified: true
      },

      # Raw CSS file.  You'll probably want that separately for including.
      {
        input:  'templates/styles.css.erb',
        output: File.join(brand_folder,'styles.css')
      },
      # Minified CSS file, for including into things in production.
      {
        input:  'templates/styles.css.erb',
        output: File.join(brand_folder,'styles.min.css'),
        minified: true
      },

      # Index file that hosts the footer, with styling.  For development.
      {
        input:  'templates/index.html.erb',
        output: File.join(brand_folder,'index.html')
      },
      # Index file with styles and footer, minified.  Because: Why not.
      {
        input:  'templates/index.html.erb',
        output: File.join(brand_folder,'index.min.html'),
        minified: true
      },

      # Demo of using lazy loading on the client side.
      {
        input:  'templates/index.lazy-load.html.erb',
        output: File.join(brand_folder,'index.lazy-load.html')
      },
      # Index file with styles and footer, minified.  Because: Why not.
      {
        input:  'templates/index.lazy-load.html.erb',
        output: File.join(brand_folder,'index.lazy-load.min.html'),
        minified: true
      }

    ].each do |configuration|
      begin
        FooterDriver.build(**configuration)
        puts "    #{configuration[:input]} : #{configuration[:output]}".green
      rescue => error
        puts '    ' + "#{configuration[:input]} : ERROR ".white.on_red
        puts "\n#{error}\n"
        print "\a"; sleep 1; # Ring the system bell an extra time as feedback.
      end
    end
    puts "\n"
  end

  def FooterDriver.build(input:, output:, minified:false)
    renderer = ERB.new(File.read(input))
    rendered_HTML = renderer.result()

    if(minified)
      compressor = HtmlCompressor::Compressor.new
      rendered_HTML = compressor.compress(rendered_HTML)
    end

    File.open(output,'w') {|file| file.write rendered_HTML }
  end

end

class String
  def dash_case
    self.gsub(/::/, '/').
    gsub(/\s/,'-').
    gsub(/([A-Z]+)([A-Z][a-z])/,'\1\-\2').
    gsub(/([a-z\d])([A-Z])/,'\1\-\2').
    downcase
  end
end
